
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, 
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  opleiding VARCHAR(100) NOT NULL CHECK (opleiding IN (
    'signspecialist',
    'immersive designer', 
    'filmacteur',
    'software developer',
    'game art',
    'photographic designer',
    'audiovisueel',
    'ecom designer',
    'mediavormgever',
    'ruimtelijke vormgever',
    'mediaredactie medewerker',
    'allround mediamaker'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snelle lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_opleiding ON users(opleiding);
