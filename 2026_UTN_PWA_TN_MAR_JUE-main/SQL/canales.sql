CREATE TABLE canales(
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nombre VARCHAR(30) NOT NULL,
    fk_id_workspace INT NOT NULL,
    
    CONSTRAINT fk_id_workspace_workspaces FOREIGN KEY (fk_id_workspace) REFERENCES workspaces(id) ON DELETE CASCADE
);
