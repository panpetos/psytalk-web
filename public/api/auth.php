<?php
declare(strict_types=1);

// Handle preflight requests for JSON POST calls
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443);
$cookieLifetime = 60 * 60 * 24 * 7; // 7 days

if (PHP_VERSION_ID >= 70300) {
    session_set_cookie_params([
        'lifetime' => $cookieLifetime,
        'path' => '/',
        'domain' => '',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
} else {
    session_set_cookie_params($cookieLifetime, '/; samesite=Lax', '', $secure, true);
}

session_name('psytalk_session');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

/**
 * Send JSON response and terminate the script.
 */
function respond($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Resolve environment variable with optional fallback to .env file.
 */
function env(string $key, $default = null)
{
    $value = getenv($key);
    if ($value !== false) {
        return $value;
    }

    if (isset($_ENV[$key])) {
        return $_ENV[$key];
    }

    static $envCache = null;
    if ($envCache === null) {
        $envPath = dirname(__DIR__, 2) . '/.env';
        if (is_file($envPath)) {
            $envCache = parse_ini_file($envPath, false, INI_SCANNER_RAW) ?: [];
        } else {
            $envCache = [];
        }
    }

    if (isset($envCache[$key])) {
        return $envCache[$key];
    }

    return $default;
}

try {
    $db = new mysqli(
        (string) env('DB_HOST', 'localhost'),
        (string) env('DB_USER', 'u3105470_psyh_user'),
        (string) env('DB_PASSWORD', 'xR3iA0zO0qwV9cF4'),
        (string) env('DB_NAME', 'u3105470_psyh')
    );
    $db->set_charset('utf8mb4');
} catch (mysqli_sql_exception $exception) {
    error_log('Database connection failed: ' . $exception->getMessage());
    respond(['error' => 'Database connection failed'], 500);
}

/**
 * Retrieve JSON payload for POST requests.
 */
function getRequestPayload(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            return [];
        }

        $data = json_decode($raw, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            respond(['error' => 'Invalid JSON payload'], 400);
        }

        return is_array($data) ? $data : [];
    }

    if (!empty($_POST)) {
        return $_POST;
    }

    return [];
}

/**
 * Fetch a single user by email.
 */
function findUserByEmail(mysqli $db, string $email): ?array
{
    $stmt = $db->prepare('SELECT id, email, password, role, first_name, last_name, avatar, is_verified, is_frozen, created_at FROM users WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc() ?: null;
    $stmt->close();
    return $user;
}

/**
 * Fetch a single user by id.
 */
function findUserById(mysqli $db, string $id): ?array
{
    $stmt = $db->prepare('SELECT id, email, password, role, first_name, last_name, avatar, is_verified, is_frozen, created_at FROM users WHERE id = ? LIMIT 1');
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc() ?: null;
    $stmt->close();
    return $user;
}

/**
 * Normalize user payload before returning to the client.
 */
function sanitizeUser(array $user): array
{
    unset($user['password']);
    $user['is_verified'] = (bool) ($user['is_verified'] ?? false);
    $user['is_frozen'] = (bool) ($user['is_frozen'] ?? false);
    return $user;
}

/**
 * Generate a version 4 UUID string.
 */
function uuidv4(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            respond(['error' => 'Method not allowed'], 405);
        }

        $payload = getRequestPayload();
        $email = isset($payload['email']) ? trim((string) $payload['email']) : '';
        $password = (string) ($payload['password'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(['error' => 'Введите корректный email'], 400);
        }

        if ($password === '') {
            respond(['error' => 'Введите пароль'], 400);
        }

        $user = findUserByEmail($db, strtolower($email));
        if (!$user) {
            respond(['error' => 'Неверный email или пароль'], 401);
        }

        if (!password_verify($password, $user['password'])) {
            respond(['error' => 'Неверный email или пароль'], 401);
        }

        if (!empty($user['is_frozen'])) {
            respond(['error' => 'Ваш аккаунт заблокирован. Обратитесь в поддержку.'], 403);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];

        respond(sanitizeUser($user));

    case 'register':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            respond(['error' => 'Method not allowed'], 405);
        }

        $payload = getRequestPayload();
        $email = isset($payload['email']) ? trim((string) $payload['email']) : '';
        $password = (string) ($payload['password'] ?? '');
        $firstName = isset($payload['firstName']) ? trim((string) $payload['firstName']) : '';
        $lastName = isset($payload['lastName']) ? trim((string) $payload['lastName']) : '';
        $role = isset($payload['role']) ? (string) $payload['role'] : 'client';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(['error' => 'Введите корректный email'], 400);
        }

        if (strlen($password) < 6) {
            respond(['error' => 'Пароль должен содержать не менее 6 символов'], 400);
        }

        if ($firstName === '' || $lastName === '') {
            respond(['error' => 'Введите имя и фамилию'], 400);
        }

        if ($role === 'user') {
            $role = 'client';
        }

        $allowedRoles = ['client', 'psychologist', 'admin'];
        if (!in_array($role, $allowedRoles, true)) {
            respond(['error' => 'Недопустимая роль пользователя'], 400);
        }

        if (findUserByEmail($db, strtolower($email))) {
            respond(['error' => 'Пользователь с таким email уже существует'], 400);
        }

        $userId = uuidv4();
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        try {
            $db->begin_transaction();

            $stmt = $db->prepare('INSERT INTO users (id, email, password, role, first_name, last_name, avatar, is_verified, is_frozen) VALUES (?, ?, ?, ?, ?, ?, NULL, 0, 0)');
            $emailLower = strtolower($email);
            $stmt->bind_param('ssssss', $userId, $emailLower, $hashedPassword, $role, $firstName, $lastName);
            $stmt->execute();
            $stmt->close();

            if ($role === 'psychologist') {
                $psychologistId = uuidv4();
                $defaultSpecialization = 'Не указана';
                $defaultEducation = 'Не указано';
                $defaultDescription = 'Заполните профиль';
                $defaultPrice = '0.00';
                $defaultFormats = json_encode(['video'], JSON_UNESCAPED_UNICODE);
                $defaultCertifications = json_encode([], JSON_UNESCAPED_UNICODE);

                $stmt = $db->prepare('INSERT INTO psychologists (id, user_id, specialization, experience, education, certifications, description, price, formats) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?)');
                $stmt->bind_param('ssssssss', $psychologistId, $userId, $defaultSpecialization, $defaultEducation, $defaultCertifications, $defaultDescription, $defaultPrice, $defaultFormats);
                $stmt->execute();
                $stmt->close();
            }

            $db->commit();
        } catch (Throwable $e) {
            $db->rollback();
            error_log('Failed to create user: ' . $e->getMessage());
            respond(['error' => 'Не удалось создать пользователя'], 500);
        }

        $user = findUserById($db, $userId);
        if (!$user) {
            respond(['error' => 'Пользователь не найден после регистрации'], 500);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];

        respond(sanitizeUser($user), 201);

    case 'me':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            respond(['error' => 'Method not allowed'], 405);
        }

        if (empty($_SESSION['user_id'])) {
            respond(['error' => 'Not authenticated'], 401);
        }

        $user = findUserById($db, (string) $_SESSION['user_id']);
        if (!$user) {
            session_destroy();
            respond(['error' => 'User not found'], 404);
        }

        if (!empty($user['is_frozen'])) {
            session_destroy();
            respond(['error' => 'Ваш аккаунт заблокирован. Обратитесь в поддержку.'], 403);
        }

        respond(sanitizeUser($user));

    case 'logout':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            respond(['error' => 'Method not allowed'], 405);
        }

        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'] ?? '/', $params['domain'] ?? '', $params['secure'] ?? false, $params['httponly'] ?? true);
        }
        session_destroy();

        respond(['message' => 'Logged out successfully']);

    default:
        respond(['error' => 'Unknown action'], 400);
}
