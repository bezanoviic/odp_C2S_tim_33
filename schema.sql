DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS team_invitations;
DROP TABLE IF EXISTS user_watchlist;
DROP TABLE IF EXISTS match_players;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS tournament_registrations;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  gamer_tag VARCHAR(30) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_image TEXT NULL,
  role ENUM('player','admin') NOT NULL DEFAULT 'player',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_users_email CHECK (CHAR_LENGTH(email)>=5 AND email LIKE '%@%.%'),
  CONSTRAINT chk_users_gamer_tag CHECK (CHAR_LENGTH(gamer_tag)>=3)
);

CREATE TABLE games (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  logo TEXT NULL,
  genre VARCHAR(50) NOT NULL,
  max_players_per_team INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_games_max_players CHECK (max_players_per_team > 0)
);

CREATE TABLE teams (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  tag VARCHAR(6) NOT NULL UNIQUE,
  logo TEXT NULL,
  description TEXT NULL,
  captain_id INT UNSIGNED NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_teams_captain FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_teams_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE team_members (
  team_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  role ENUM('captain', 'member') NOT NULL DEFAULT 'member',
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id),
  CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE TABLE team_invitations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_id INT UNSIGNED NOT NULL,
  invited_user_id INT UNSIGNED NOT NULL,
  invited_by_user_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME NULL,
  CONSTRAINT fk_team_invitations_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_invitations_invited_user FOREIGN KEY (invited_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_invitations_invited_by FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_team_invitations_invited_user_id ON team_invitations(invited_user_id);
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);

CREATE TABLE tournaments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  game_id INT UNSIGNED NOT NULL,
  format ENUM('single_elimination', 'double_elimination', 'round_robin') NOT NULL,
  max_teams INT UNSIGNED NOT NULL,
  prize_pool DECIMAL(12, 2) NOT NULL DEFAULT 0,
  registration_deadline DATETIME NOT NULL,
  start_date DATETIME NOT NULL,
  status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'upcoming',
  created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tournaments_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT fk_tournaments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_tournaments_max_teams CHECK (max_teams > 1),
  CONSTRAINT chk_tournaments_dates CHECK (registration_deadline <= start_date)
);

CREATE INDEX idx_tournaments_game_id ON tournaments(game_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);

CREATE TABLE tournament_registrations (
  tournament_id INT UNSIGNED NOT NULL,
  team_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'confirmed', 'disqualified') NOT NULL DEFAULT 'pending',
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seed INT UNSIGNED NULL,
  PRIMARY KEY (tournament_id, team_id),
  CONSTRAINT fk_tournament_registrations_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  CONSTRAINT fk_tournament_registrations_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE INDEX idx_tournament_registrations_team_id ON tournament_registrations(team_id);
CREATE INDEX idx_tournament_registrations_status ON tournament_registrations(status);

CREATE TABLE user_watchlist (
  user_id INT UNSIGNED NOT NULL,
  tournament_id INT UNSIGNED NOT NULL,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tournament_id),
  CONSTRAINT fk_user_watchlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_watchlist_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_watchlist_tournament_id ON user_watchlist(tournament_id);

CREATE TABLE matches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT UNSIGNED NOT NULL,
  round_number INT UNSIGNED NOT NULL,
  match_number INT UNSIGNED NOT NULL,
  team1_id INT UNSIGNED NULL,
  team2_id INT UNSIGNED NULL,
  team1_score INT UNSIGNED NULL,
  team2_score INT UNSIGNED NULL,
  winner_team_id INT UNSIGNED NULL,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  scheduled_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_matches_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  CONSTRAINT fk_matches_team1 FOREIGN KEY (team1_id) REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT fk_matches_team2 FOREIGN KEY (team2_id) REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT fk_matches_winner FOREIGN KEY (winner_team_id) REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT uq_matches_tournament_round_match UNIQUE (tournament_id, round_number, match_number)
);

CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_winner_team_id ON matches(winner_team_id);

CREATE TABLE match_players (
  match_id INT UNSIGNED NOT NULL,
  team_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  performance_notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (match_id, team_id, user_id),
  CONSTRAINT fk_match_players_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_players_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_players_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_match_players_team_id ON match_players(team_id);
CREATE INDEX idx_match_players_user_id ON match_players(user_id);

CREATE TABLE audit_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id INT UNSIGNED NULL,
  details TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
