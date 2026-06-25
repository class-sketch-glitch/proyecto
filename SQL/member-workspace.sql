-- CONTRATO PARA CLAVE FORANEA: CONSTRAINT fk_id_usuario_usuarios FOREIGN KEY (fk_id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
-- Traduccion: Creamos un contrato de clave foranea llamado fk_id_usuario_usuarios, establece que la columna fk_id_usuario se relaciona con la clave primaria id de la tabla de usuarios. Si el usuario se elimina, eliminan las membresias asociadas a el.

-- ENUM: Nos permite determinar una serie de valores posibles para x columna, si al insertar o actualizar el valor no esta dentro de esta lista, la operacion se rechaza
CREATE TABLE miembros_workspace (
	id INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_usuario INT NOT NULL,
    fk_id_workspace INT NOT NULL,
    role ENUM ("admin", "owner", "user") DEFAULT "user" NOT NULL,
    
    CONSTRAINT fk_id_usuario_usuarios FOREIGN KEY (fk_id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_id_workspace_workspaces FOREIGN KEY (fk_id_workspace) REFERENCES workspaces(id) ON DELETE CASCADE
)