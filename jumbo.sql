CREATE TABLE IF NOT EXISTS angajati (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nume TEXT NOT NULL UNIQUE
);

INSERT OR IGNORE INTO angajati (nume) VALUES
('Valentin (Bucătar)'),
('Marina'),
('Vitalie (Bucătar)'),
('Olga (Bucătar)'),
('Natalia'),
('Marina (Vase)'),
('Diana'),
('Elena'),
('Olga'),
('Snejana'),
('Svetlana');

CREATE TABLE IF NOT EXISTS prezenta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_angajat INTEGER NOT NULL,
    data DATE NOT NULL,
    ora_sosire TEXT,
    ora_plecare TEXT,
    UNIQUE(id_angajat, data),
    FOREIGN KEY (id_angajat) REFERENCES angajati(id)
);