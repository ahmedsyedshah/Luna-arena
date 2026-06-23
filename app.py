"""
LUNA ARENA — Backend Server
Flask + SQLite | All CRUD operations
Run: python app.py
"""

from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import sqlite3, hashlib, os, re

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = 'luna_arena_secret_2026'
CORS(app, supports_credentials=True)

DB = 'luna_arena.db'

# ─── DB SETUP ────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # TABLE 1: users
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name  TEXT NOT NULL,
        last_name   TEXT NOT NULL,
        age         INTEGER,
        email       TEXT UNIQUE NOT NULL,
        password    TEXT NOT NULL,
        role        TEXT DEFAULT 'user',
        theme       TEXT DEFAULT 'dark',
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # TABLE 2: players
    c.execute('''CREATE TABLE IF NOT EXISTS players (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL,
        game        TEXT NOT NULL,
        role        TEXT NOT NULL,
        rank        TEXT NOT NULL,
        wins        INTEGER DEFAULT 0,
        kd          REAL DEFAULT 0.0,
        hours       INTEGER DEFAULT 0,
        score       INTEGER DEFAULT 0,
        bio         TEXT,
        achievements TEXT
    )''')

    # TABLE 3: tournaments
    c.execute('''CREATE TABLE IF NOT EXISTS tournaments (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT NOT NULL,
        game         TEXT NOT NULL,
        date         TEXT NOT NULL,
        prize        TEXT,
        status       TEXT DEFAULT 'upcoming',
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # TABLE 4: registrations
    c.execute('''CREATE TABLE IF NOT EXISTS registrations (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id         INTEGER,
        tournament_id   INTEGER,
        gamer_tag       TEXT NOT NULL,
        email           TEXT NOT NULL,
        payment_ref     TEXT,
        payment_status  TEXT DEFAULT 'pending',
        registered_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
    )''')

    # TABLE 5: contact_messages
    c.execute('''CREATE TABLE IF NOT EXISTS contact_messages (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        gamer_tag    TEXT NOT NULL,
        email        TEXT NOT NULL,
        inquiry_type TEXT NOT NULL,
        message      TEXT NOT NULL,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Seed players if empty
    c.execute('SELECT COUNT(*) FROM players')
    if c.fetchone()[0] == 0:
        players = [
            ('LUNA_VOID',  'Valorant', 'Sniper',     'Top', 344, 4.8, 920, 9200, 'The undisputed queen.', 'Global #1, Ace Streak, Untouchable'),
            ('STARR_X',    'Valorant', 'Duelist',    'Top', 298, 4.1, 810, 8100, 'Entry frag specialist.',  'MVP x12, First Blood Queen, Top Fragger'),
            ('NOVA_RIFT',  'Apex',     'IGL',        'Top', 270, 3.7, 780, 7800, 'The smartest in any lobby.', 'Tactical Genius, Season Champion, Zero Deaths'),
            ('MYST_KAI',   'Apex',     'Support',    'Mid', 188, 2.6, 540, 5400, 'Quiet in comms, loud in impact.', 'Top Support, Clutch Factor'),
            ('VALE_RUN',   'CS2',      'Rifler',     'Mid', 201, 2.9, 610, 6100, 'Consistent. Methodical.', 'Deagle God, Mid Control, Rising Star'),
            ('ZARA_NET',   'CS2',      'AWPer',      'Mid', 175, 2.4, 490, 4900, "She doesn't miss.", 'Cold Blood, Long Range Queen'),
            ('LYRA_ACE',   'Valorant', 'Controller', 'Mid', 165, 2.2, 460, 4600, 'You think you have vision? You don\'t.', 'Smoke Master, Map Control'),
            ('PIXL_DASH',  'Fortnite', 'Builder',    'Low',  82, 1.5, 310, 3100, 'Ceiling is nowhere in sight.', 'Builder Prodigy'),
            ('ECHO_7',     'Fortnite', 'Rusher',     'Low',  65, 1.1, 240, 2400, 'Chaotic. Fearless.', '100-0 Combo'),
        ]
        c.executemany('INSERT INTO players (name,game,role,rank,wins,kd,hours,score,bio,achievements) VALUES (?,?,?,?,?,?,?,?,?,?)', players)

    # Seed tournaments if empty
    c.execute('SELECT COUNT(*) FROM tournaments')
    if c.fetchone()[0] == 0:
        tournaments = [
            ('Neon Clash Season Open',  'Valorant',      '2026-07-10', '$500',  'upcoming'),
            ('Apex Predator Cup',       'Apex Legends',  '2026-07-18', '$750',  'upcoming'),
            ('CS2 Circuit Finals',      'CS2',           '2026-08-02', '$1000', 'upcoming'),
            ('Fortnite Storm Cup',      'Fortnite',      '2026-08-15', '$300',  'upcoming'),
            ('Luna Arena Grand Finals', 'All Games',     '2026-09-01', '$5000', 'upcoming'),
        ]
        c.executemany('INSERT INTO tournaments (name,game,date,prize,status) VALUES (?,?,?,?,?)', tournaments)

    # Seed admin user if not exists
    c.execute("SELECT COUNT(*) FROM users WHERE role='admin'")
    if c.fetchone()[0] == 0:
        pw = hashlib.sha256('Admin@123'.encode()).hexdigest()
        c.execute("INSERT INTO users (first_name,last_name,age,email,password,role) VALUES (?,?,?,?,?,?)",
                  ('Admin','Luna', 25, 'admin@lunaarena.com', pw, 'admin'))

    conn.commit()
    conn.close()

# ─── SERVE FRONTEND ──────────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

# ─── AUTH ROUTES ─────────────────────────────────────────────
@app.route('/api/signup', methods=['POST'])
def signup():
    d = request.json
    required = ['firstName','lastName','age','email','password']
    if not all(d.get(k) for k in required):
        return jsonify({'error': 'All fields required'}), 400
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', d['email']):
        return jsonify({'error': 'Invalid email'}), 400
    pw = hashlib.sha256(d['password'].encode()).hexdigest()
    try:
        conn = get_db()
        conn.execute('INSERT INTO users (first_name,last_name,age,email,password) VALUES (?,?,?,?,?)',
                     (d['firstName'], d['lastName'], d['age'], d['email'], pw))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Account created!'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already registered'}), 409

@app.route('/api/login', methods=['POST'])
def login():
    d = request.json
    pw = hashlib.sha256(d.get('password','').encode()).hexdigest()
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE email=? AND password=?', (d.get('email'), pw)).fetchone()
    conn.close()
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401
    session['user_id'] = user['id']
    session['user_role'] = user['role']
    return jsonify({'success': True, 'role': user['role'], 'name': user['first_name']})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/me')
def me():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    conn = get_db()
    user = conn.execute('SELECT id,first_name,last_name,age,email,role,theme,created_at FROM users WHERE id=?',
                        (session['user_id'],)).fetchone()
    conn.close()
    return jsonify(dict(user))

@app.route('/api/me/theme', methods=['PUT'])
def update_theme():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    theme = request.json.get('theme', 'dark')
    conn = get_db()
    conn.execute('UPDATE users SET theme=? WHERE id=?', (theme, session['user_id']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ─── PLAYERS ROUTES ──────────────────────────────────────────
@app.route('/api/players')
def get_players():
    conn = get_db()
    rows = conn.execute('SELECT * FROM players ORDER BY score DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ─── LEADERBOARD ─────────────────────────────────────────────
@app.route('/api/leaderboard')
def leaderboard():
    conn = get_db()
    rows = conn.execute('SELECT name, score, rank, game FROM players ORDER BY score DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ─── TOURNAMENT ROUTES ───────────────────────────────────────
@app.route('/api/tournaments')
def get_tournaments():
    conn = get_db()
    rows = conn.execute('SELECT * FROM tournaments ORDER BY date ASC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/tournaments/register', methods=['POST'])
def register_tournament():
    d = request.json
    required = ['gamerTag','email','tournamentId','paymentRef']
    if not all(d.get(k) for k in required):
        return jsonify({'error': 'All fields required'}), 400
    user_id = session.get('user_id')
    conn = get_db()
    conn.execute(
        'INSERT INTO registrations (user_id,tournament_id,gamer_tag,email,payment_ref,payment_status) VALUES (?,?,?,?,?,?)',
        (user_id, d['tournamentId'], d['gamerTag'], d['email'], d['paymentRef'], 'paid')
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Registration confirmed!'})

# ─── CONTACT ROUTE ───────────────────────────────────────────
@app.route('/api/contact', methods=['POST'])
def contact():
    d = request.json
    if not all(d.get(k) for k in ['gamerTag','email','inquiryType','message']):
        return jsonify({'error': 'All fields required'}), 400
    conn = get_db()
    conn.execute(
        'INSERT INTO contact_messages (gamer_tag,email,inquiry_type,message) VALUES (?,?,?,?)',
        (d['gamerTag'], d['email'], d['inquiryType'], d['message'])
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ─── ADMIN ROUTES ────────────────────────────────────────────
def admin_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if session.get('user_role') != 'admin':
            return jsonify({'error': 'Admin only'}), 403
        return fn(*args, **kwargs)
    return wrapper

@app.route('/api/admin/users')
@admin_required
def admin_users():
    conn = get_db()
    rows = conn.execute('SELECT id,first_name,last_name,email,age,role,created_at FROM users ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/admin/users/<int:uid>', methods=['PUT'])
@admin_required
def admin_update_user(uid):
    d = request.json
    conn = get_db()
    conn.execute('UPDATE users SET first_name=?,last_name=?,email=?,role=? WHERE id=?',
                 (d['first_name'], d['last_name'], d['email'], d['role'], uid))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/admin/users/<int:uid>', methods=['DELETE'])
@admin_required
def admin_delete_user(uid):
    conn = get_db()
    conn.execute('DELETE FROM users WHERE id=?', (uid,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/admin/registrations')
@admin_required
def admin_registrations():
    conn = get_db()
    rows = conn.execute('''
        SELECT r.*, t.name as tournament_name
        FROM registrations r
        LEFT JOIN tournaments t ON r.tournament_id = t.id
        ORDER BY r.registered_at DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/admin/messages')
@admin_required
def admin_messages():
    conn = get_db()
    rows = conn.execute('SELECT * FROM contact_messages ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/admin/players', methods=['POST'])
@admin_required
def admin_add_player():
    d = request.json
    conn = get_db()
    conn.execute(
        'INSERT INTO players (name,game,role,rank,wins,kd,hours,score,bio,achievements) VALUES (?,?,?,?,?,?,?,?,?,?)',
        (d['name'],d['game'],d['role'],d['rank'],d.get('wins',0),d.get('kd',0),d.get('hours',0),d.get('score',0),d.get('bio',''),d.get('achievements',''))
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/admin/players/<int:pid>', methods=['PUT'])
@admin_required
def admin_update_player(pid):
    d = request.json
    conn = get_db()
    conn.execute(
        'UPDATE players SET name=?,game=?,role=?,rank=?,wins=?,kd=?,hours=?,score=?,bio=?,achievements=? WHERE id=?',
        (d['name'],d['game'],d['role'],d['rank'],d['wins'],d['kd'],d['hours'],d['score'],d['bio'],d['achievements'],pid)
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/admin/players/<int:pid>', methods=['DELETE'])
@admin_required
def admin_delete_player(pid):
    conn = get_db()
    conn.execute('DELETE FROM players WHERE id=?', (pid,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    init_db()
    print("\n🚀 LUNA ARENA SERVER RUNNING")
    print("   Open: http://localhost:5000")
    print("   Admin login: admin@lunaarena.com / Admin@123\n")
    app.run(debug=True, port=5000)
