package com.foodies.repository;

import com.foodies.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

/**
 * JDBC repository for customer account persistence in PostgreSQL.
 */
@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<User> USER_ROW_MAPPER = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getInt("id"));
        user.setFullName(rs.getString("full_name"));
        user.setEmail(rs.getString("email"));
        user.setPhone(rs.getString("phone"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setDefaultAddress(rs.getString("default_address"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            user.setCreatedAt(createdAt.toLocalDateTime());
        }
        return user;
    };

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    public Optional<User> findByEmail(String email) {
        String sql = """
                SELECT id, full_name, email, phone, password_hash, default_address, created_at
                FROM users
                WHERE LOWER(email) = LOWER(?)
                """;
        List<User> results = jdbcTemplate.query(sql, USER_ROW_MAPPER, email);
        return results.stream().findFirst();
    }

    public Optional<User> findById(Integer id) {
        String sql = """
                SELECT id, full_name, email, phone, password_hash, default_address, created_at
                FROM users
                WHERE id = ?
                """;
        List<User> results = jdbcTemplate.query(sql, USER_ROW_MAPPER, id);
        return results.stream().findFirst();
    }

    public User save(User user) {
        String sql = """
                INSERT INTO users (full_name, email, phone, password_hash, default_address)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id
                """;
        Integer generatedId = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getPasswordHash(),
                user.getDefaultAddress()
        );
        user.setId(generatedId);
        return user;
    }
}

