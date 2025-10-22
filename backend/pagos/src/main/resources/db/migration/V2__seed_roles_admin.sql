-- Roles base
INSERT INTO sistemapagotarjeta.catalogo_rol_usuario (idRol, Descripcion, Activo)
VALUES (1,'ADMIN',1),(2,'USUARIO',1)
ON DUPLICATE KEY UPDATE Descripcion=VALUES(Descripcion), Activo=VALUES(Activo);

-- Admin Persona
INSERT INTO sistemapagotarjeta.Persona
(Nombre, Correo, Contrasenna, Rol, Activo, Fecha_Creacion, Fecha_Modificacion, catalogo_genero_idGenero)
VALUES ('Giann', 'Giann33@outlook.com', '$2a$10$HASH_BCRYPT_AQUI', 1, 1, NOW(), NOW(), 1)
ON DUPLICATE KEY UPDATE Contrasenna=VALUES(Contrasenna);

-- Vincular en Usuario
INSERT INTO sistemapagotarjeta.Usuario
(Activo, Fecha_Creacion, Fecha_Modificacion, catalogo_rol_usuario_idRol, Persona_idUsuario)
SELECT 1, NOW(), NOW(), 1, p.idPersona
FROM sistemapagotarjeta.Persona p
WHERE p.Correo='Giann33@outlook.com'
ON DUPLICATE KEY UPDATE catalogo_rol_usuario_idRol=VALUES(catalogo_rol_usuario_idRol);