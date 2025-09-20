-- ===========================================
-- CONSULTAS PEDIDAS
-- ===========================================

-- 1 - A quantidade de horas que cada professor tem comprometido em aulas:

SELECT 
    p.id AS professor_id,
    p.name AS professor_name,
    SUM(TIMESTAMPDIFF(HOUR, cs.start_time, cs.end_time)) AS total_hours
FROM PROFESSOR p
JOIN SUBJECT s ON s.taught_by = p.id
JOIN CLASS c ON c.subject_id = s.id
JOIN CLASS_SCHEDULE cs ON cs.class_id = c.id
GROUP BY p.id, p.name
ORDER BY total_hours DESC;

-- 2 - Lista de salas com horários livres e ocupados:

SELECT 
    r.id AS room_id,
    r.building_id,
    COALESCE(cs.day_of_week, '-') AS day_of_week,
    COALESCE(cs.start_time, '-') AS start_time,
    COALESCE(cs.end_time, '-') AS end_time,
    CASE 
        WHEN cs.id IS NULL THEN 'LIVRE'
        ELSE 'OCUPADO'
    END AS status
FROM ROOM r
LEFT JOIN CLASS_SCHEDULE cs ON cs.room_id = r.id
ORDER BY r.id, cs.day_of_week, cs.start_time;

-- ===========================================
-- SCRIPT DE CRIAÇÃO DO BANCO (DDL)
-- ===========================================

-- Criar o banco
CREATE DATABASE escola_chavito;
USE escola_chavito;

-- Departamentos
CREATE TABLE DEPARTMENT (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Títulos (Mestre, Doutor, etc.)
CREATE TABLE TITLE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Professores
CREATE TABLE PROFESSOR (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INT,
    title_id INT,
    FOREIGN KEY (department_id) REFERENCES DEPARTMENT(id),
    FOREIGN KEY (title_id) REFERENCES TITLE(id)
);

-- Disciplinas (Subjects)
CREATE TABLE SUBJECT (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    taught_by INT,
    FOREIGN KEY (taught_by) REFERENCES PROFESSOR(id)
);

-- Pré-requisitos de disciplinas
CREATE TABLE SUBJECT_PREREQUISITE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    prerequisite_id INT NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES SUBJECT(id),
    FOREIGN KEY (prerequisite_id) REFERENCES SUBJECT(id)
);

-- Prédios
CREATE TABLE BUILDING (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Salas
CREATE TABLE ROOM (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    FOREIGN KEY (building_id) REFERENCES BUILDING(id)
);

-- Turmas (Class)
CREATE TABLE CLASS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    semester VARCHAR(20),
    year INT,
    FOREIGN KEY (subject_id) REFERENCES SUBJECT(id)
);

-- Horários das turmas
CREATE TABLE CLASS_SCHEDULE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    room_id INT NOT NULL,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (class_id) REFERENCES CLASS(id),
    FOREIGN KEY (room_id) REFERENCES ROOM(id)
);

-- ===========================================
-- DADOS DE EXEMPLO (INSERTS)
-- ===========================================

-- Departamentos e títulos
INSERT INTO DEPARTMENT (name) VALUES ('Matemática'), ('Física');
INSERT INTO TITLE (name) VALUES ('Mestre'), ('Doutor');

-- Professores
INSERT INTO PROFESSOR (name, department_id, title_id) VALUES
('Girafales', 1, 2),
('Chapatin', 2, 1);

-- Prédios e salas
INSERT INTO BUILDING (name) VALUES ('Bloco A'), ('Bloco B');
INSERT INTO ROOM (building_id) VALUES (1), (1), (2);

-- Disciplinas
INSERT INTO SUBJECT (code, name, taught_by) VALUES
('MAT101', 'Álgebra', 1),
('FIS201', 'Mecânica', 2);

-- Turmas
INSERT INTO CLASS (subject_id, semester, year) VALUES
(1, '1º', 2025),
(2, '1º', 2025);

-- Horários
INSERT INTO CLASS_SCHEDULE (class_id, room_id, day_of_week, start_time, end_time) VALUES
(1, 1, 'Monday', '08:00:00', '10:00:00'),
(2, 2, 'Tuesday', '14:00:00', '17:00:00');
