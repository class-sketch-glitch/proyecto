-- SQL es un lenguaje de programacion NO case sensitive
-- INT = Entero 
-- DECIMAL(10,2) = Decimal 
-- TINYINT = Entero chico
-- TINYINT(1) si la version es vieja se suele usar esta forma porque boolean no existe | BOOLEAN = 0 o 1, sirve para guardar booleanos
-- VARCHAR(lenght) = Alfanumerico hasta 255 caracteres
-- TEXT(lenght hasta 64000)

-- Si el campo es AUTO_INCREMENT por cada insercion en la DB este campo por defecto intentara asignar como valor +1 del valor de seed actual
-- Si el campo es PRIMARY KEY se verificara cada vez que insertes o actualices que el valor NO este presente en la tabla. En criollo: Se asegura que sea un valor UNICO
CREATE TABLE usuarios (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    descripcion TEXT(3000)
);