-- Create enum type for difficulty level
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Moves table
CREATE TABLE IF NOT EXISTS moves (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    difficulty_level difficulty_level,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Routines table
CREATE TABLE IF NOT EXISTS routines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Routine_Moves junction table
CREATE TABLE IF NOT EXISTS routine_moves (
    routine_id INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    move_id INTEGER NOT NULL REFERENCES moves(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (routine_id, move_id, order_index)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_moves_user_id ON moves(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_moves_routine_id ON routine_moves(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_moves_move_id ON routine_moves(move_id);
CREATE INDEX IF NOT EXISTS idx_moves_difficulty ON moves(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);




