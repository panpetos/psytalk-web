// MySQL Storage Implementation
const { query, queryOne } = require('./db');
const { randomUUID } = require('crypto');

class MySQLStorage {
  // ========== USER METHODS ==========
  
  async getUser(id) {
    return await queryOne(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
  }

  async getUserByEmail(email) {
    return await queryOne(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  }

  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      id,
      email: insertUser.email,
      password: insertUser.password,
      role: insertUser.role,
      first_name: insertUser.firstName,
      last_name: insertUser.lastName,
      avatar: insertUser.avatar || null,
      is_verified: false,
      is_frozen: false
    };

    await query(
      `INSERT INTO users (id, email, password, role, first_name, last_name, avatar, is_verified, is_frozen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.password, user.role, user.first_name, user.last_name, user.avatar, user.is_verified, user.is_frozen]
    );

    return this.getUser(id);
  }

  async updateUser(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.firstName !== undefined) {
      fields.push('first_name = ?');
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      fields.push('last_name = ?');
      values.push(updates.lastName);
    }
    if (updates.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(updates.avatar);
    }
    if (updates.isVerified !== undefined) {
      fields.push('is_verified = ?');
      values.push(updates.isVerified);
    }
    if (updates.isFrozen !== undefined) {
      fields.push('is_frozen = ?');
      values.push(updates.isFrozen);
    }
    
    if (fields.length === 0) return this.getUser(id);
    
    values.push(id);
    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.getUser(id);
  }

  async deleteUser(id) {
    const result = await query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  async getAllUsers() {
    return await query('SELECT * FROM users ORDER BY created_at DESC');
  }

  // ========== PSYCHOLOGIST METHODS ==========

  async getPsychologist(id) {
    const psych = await queryOne(
      'SELECT * FROM psychologists WHERE id = ?',
      [id]
    );
    
    if (!psych) return null;
    
    // Parse JSON fields
    if (psych.certifications) {
      psych.certifications = JSON.parse(psych.certifications);
    }
    if (psych.formats) {
      psych.formats = JSON.parse(psych.formats);
    }
    
    return psych;
  }

  async getPsychologistByUserId(userId) {
    const psych = await queryOne(
      'SELECT * FROM psychologists WHERE user_id = ?',
      [userId]
    );
    
    if (!psych) return null;
    
    // Parse JSON fields
    if (psych.certifications) {
      psych.certifications = JSON.parse(psych.certifications);
    }
    if (psych.formats) {
      psych.formats = JSON.parse(psych.formats);
    }
    
    return psych;
  }

  async createPsychologist(insertPsychologist) {
    const id = randomUUID();
    
    await query(
      `INSERT INTO psychologists 
       (id, user_id, specialization, experience, education, certifications, description, price, formats, is_approved, rating, total_reviews)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        insertPsychologist.userId,
        insertPsychologist.specialization,
        insertPsychologist.experience,
        insertPsychologist.education,
        JSON.stringify(insertPsychologist.certifications || []),
        insertPsychologist.description,
        insertPsychologist.price,
        JSON.stringify(insertPsychologist.formats || []),
        false,
        0.00,
        0
      ]
    );

    return this.getPsychologist(id);
  }

  async updatePsychologist(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.specialization !== undefined) {
      fields.push('specialization = ?');
      values.push(updates.specialization);
    }
    if (updates.experience !== undefined) {
      fields.push('experience = ?');
      values.push(updates.experience);
    }
    if (updates.education !== undefined) {
      fields.push('education = ?');
      values.push(updates.education);
    }
    if (updates.certifications !== undefined) {
      fields.push('certifications = ?');
      values.push(JSON.stringify(updates.certifications));
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.price !== undefined) {
      fields.push('price = ?');
      values.push(updates.price);
    }
    if (updates.formats !== undefined) {
      fields.push('formats = ?');
      values.push(JSON.stringify(updates.formats));
    }
    if (updates.isApproved !== undefined) {
      fields.push('is_approved = ?');
      values.push(updates.isApproved);
    }
    if (updates.rating !== undefined) {
      fields.push('rating = ?');
      values.push(updates.rating);
    }
    if (updates.totalReviews !== undefined) {
      fields.push('total_reviews = ?');
      values.push(updates.totalReviews);
    }
    
    if (fields.length === 0) return this.getPsychologist(id);
    
    values.push(id);
    await query(
      `UPDATE psychologists SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.getPsychologist(id);
  }

  async searchPsychologists(filters = {}) {
    let sql = `
      SELECT 
        p.*,
        u.id as user_id,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.avatar as user_avatar
      FROM psychologists p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.isApproved !== undefined) {
      sql += ' AND p.is_approved = ?';
      params.push(filters.isApproved);
    }

    if (filters.specialization) {
      sql += ' AND p.specialization LIKE ?';
      params.push(`%${filters.specialization}%`);
    }

    if (filters.minPrice !== undefined) {
      sql += ' AND p.price >= ?';
      params.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      sql += ' AND p.price <= ?';
      params.push(filters.maxPrice);
    }

    sql += ' ORDER BY p.rating DESC, p.total_reviews DESC';

    const rows = await query(sql, params);
    
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      specialization: row.specialization,
      experience: row.experience,
      education: row.education,
      certifications: row.certifications ? JSON.parse(row.certifications) : [],
      description: row.description,
      price: row.price,
      formats: row.formats ? JSON.parse(row.formats) : [],
      isApproved: Boolean(row.is_approved),
      rating: row.rating,
      totalReviews: row.total_reviews,
      user: {
        id: row.user_id,
        email: row.user_email,
        firstName: row.user_first_name,
        lastName: row.user_last_name,
        avatar: row.user_avatar,
        role: 'psychologist'
      }
    }));
  }

  async getPendingPsychologists() {
    return this.searchPsychologists({ isApproved: false });
  }

  async approvePsychologist(psychologistId) {
    await query(
      'UPDATE psychologists SET is_approved = TRUE WHERE id = ?',
      [psychologistId]
    );
  }

  async rejectPsychologist(psychologistId) {
    // For now, just delete the psychologist
    await query('DELETE FROM psychologists WHERE id = ?', [psychologistId]);
  }

  async blockUser(userId) {
    await query(
      'UPDATE users SET is_frozen = TRUE WHERE id = ?',
      [userId]
    );
  }

  async unblockUser(userId) {
    await query(
      'UPDATE users SET is_frozen = FALSE WHERE id = ?',
      [userId]
    );
  }

  // ========== APPOINTMENT METHODS ==========

  async getAppointment(id) {
    return await queryOne(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );
  }

  async createAppointment(insertAppointment) {
    const id = randomUUID();
    
    await query(
      `INSERT INTO appointments 
       (id, client_id, psychologist_id, date_time, duration, format, status, price, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        insertAppointment.clientId,
        insertAppointment.psychologistId,
        insertAppointment.dateTime,
        insertAppointment.duration || 50,
        insertAppointment.format,
        'scheduled',
        insertAppointment.price,
        insertAppointment.notes || null
      ]
    );

    return this.getAppointment(id);
  }

  async updateAppointment(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.dateTime !== undefined) {
      fields.push('date_time = ?');
      values.push(updates.dateTime);
    }
    
    if (fields.length === 0) return this.getAppointment(id);
    
    values.push(id);
    await query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.getAppointment(id);
  }

  async getAppointmentsByClient(clientId) {
    const sql = `
      SELECT 
        a.*,
        c.email as client_email,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.avatar as client_avatar,
        p.id as psych_id,
        p.specialization as psych_specialization,
        p.experience as psych_experience,
        p.rating as psych_rating,
        pu.id as psych_user_id,
        pu.email as psych_user_email,
        pu.first_name as psych_user_first_name,
        pu.last_name as psych_user_last_name,
        pu.avatar as psych_user_avatar
      FROM appointments a
      JOIN users c ON a.client_id = c.id
      JOIN psychologists p ON a.psychologist_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE a.client_id = ?
      ORDER BY a.date_time DESC
    `;
    
    const rows = await query(sql, [clientId]);
    return this.formatAppointmentRows(rows);
  }

  async getAppointmentsByPsychologist(psychologistId) {
    const sql = `
      SELECT 
        a.*,
        c.email as client_email,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.avatar as client_avatar,
        p.id as psych_id,
        p.specialization as psych_specialization,
        p.experience as psych_experience,
        p.rating as psych_rating,
        pu.id as psych_user_id,
        pu.email as psych_user_email,
        pu.first_name as psych_user_first_name,
        pu.last_name as psych_user_last_name,
        pu.avatar as psych_user_avatar
      FROM appointments a
      JOIN users c ON a.client_id = c.id
      JOIN psychologists p ON a.psychologist_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE a.psychologist_id = ?
      ORDER BY a.date_time DESC
    `;
    
    const rows = await query(sql, [psychologistId]);
    return this.formatAppointmentRows(rows);
  }

  formatAppointmentRows(rows) {
    return rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      psychologistId: row.psychologist_id,
      dateTime: row.date_time,
      duration: row.duration,
      format: row.format,
      status: row.status,
      price: row.price,
      notes: row.notes,
      createdAt: row.created_at,
      client: {
        id: row.client_id,
        email: row.client_email,
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        avatar: row.client_avatar,
        role: 'client'
      },
      psychologist: {
        id: row.psych_id,
        specialization: row.psych_specialization,
        experience: row.psych_experience,
        rating: row.psych_rating,
        user: {
          id: row.psych_user_id,
          email: row.psych_user_email,
          firstName: row.psych_user_first_name,
          lastName: row.psych_user_last_name,
          avatar: row.psych_user_avatar,
          role: 'psychologist'
        }
      }
    }));
  }

  // ========== REVIEW METHODS ==========

  async createReview(insertReview) {
    const id = randomUUID();
    
    await query(
      `INSERT INTO reviews 
       (id, appointment_id, client_id, psychologist_id, rating, comment, is_moderated)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        insertReview.appointmentId,
        insertReview.clientId,
        insertReview.psychologistId,
        insertReview.rating,
        insertReview.comment || null,
        false
      ]
    );

    // Update psychologist rating
    await this.updatePsychologistRating(insertReview.psychologistId);

    return await queryOne('SELECT * FROM reviews WHERE id = ?', [id]);
  }

  async updatePsychologistRating(psychologistId) {
    const stats = await queryOne(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count 
       FROM reviews 
       WHERE psychologist_id = ?`,
      [psychologistId]
    );

    if (stats && stats.count > 0) {
      await query(
        'UPDATE psychologists SET rating = ?, total_reviews = ? WHERE id = ?',
        [parseFloat(stats.avg_rating).toFixed(2), stats.count, psychologistId]
      );
    }
  }

  async getReviewsByPsychologist(psychologistId) {
    const sql = `
      SELECT 
        r.*,
        c.email as client_email,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.avatar as client_avatar,
        p.specialization as psych_specialization,
        pu.first_name as psych_first_name,
        pu.last_name as psych_last_name
      FROM reviews r
      JOIN users c ON r.client_id = c.id
      JOIN psychologists p ON r.psychologist_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE r.psychologist_id = ?
      ORDER BY r.created_at DESC
    `;
    
    const rows = await query(sql, [psychologistId]);
    return rows.map(row => ({
      id: row.id,
      appointmentId: row.appointment_id,
      clientId: row.client_id,
      psychologistId: row.psychologist_id,
      rating: row.rating,
      comment: row.comment,
      isModerated: Boolean(row.is_moderated),
      createdAt: row.created_at,
      client: {
        id: row.client_id,
        email: row.client_email,
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        avatar: row.client_avatar,
        role: 'client'
      },
      psychologist: {
        id: row.psychologist_id,
        specialization: row.psych_specialization,
        user: {
          firstName: row.psych_first_name,
          lastName: row.psych_last_name,
          role: 'psychologist'
        }
      }
    }));
  }

  // ========== MESSAGE METHODS ==========

  async createMessage(insertMessage) {
    const id = randomUUID();
    
    await query(
      `INSERT INTO messages (id, sender_id, receiver_id, content, is_read)
       VALUES (?, ?, ?, ?, ?)`,
      [id, insertMessage.senderId, insertMessage.receiverId, insertMessage.content, false]
    );

    return await queryOne('SELECT * FROM messages WHERE id = ?', [id]);
  }

  async getMessagesBetween(user1Id, user2Id) {
    return await query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [user1Id, user2Id, user2Id, user1Id]
    );
  }

  // ========== AVAILABILITY METHODS ==========

  async createAvailability(insertAvailability) {
    const id = randomUUID();
    
    await query(
      `INSERT INTO availability (id, psychologist_id, day_of_week, start_time, end_time, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        insertAvailability.psychologistId,
        insertAvailability.dayOfWeek,
        insertAvailability.startTime,
        insertAvailability.endTime,
        true
      ]
    );

    return await queryOne('SELECT * FROM availability WHERE id = ?', [id]);
  }

  async getAvailabilityByPsychologist(psychologistId) {
    return await query(
      'SELECT * FROM availability WHERE psychologist_id = ? AND is_active = TRUE ORDER BY day_of_week, start_time',
      [psychologistId]
    );
  }
}

module.exports = { MySQLStorage };
