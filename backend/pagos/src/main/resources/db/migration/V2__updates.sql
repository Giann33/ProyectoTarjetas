
ALTER TABLE sistemapagotarjeta.persona
ADD COLUMN apellido VARCHAR(100);

/*
UPDATE sistemapagotarjeta.persona
set apellido = 'Corredera Quesada'
Where idPersona = 3;

UPDATE sistemapagotarjeta.persona
set apellido = 'Jimenez Campos'
Where idPersona = 5;
*/

INSERT INTO `sistemapagotarjeta`.`catalogo_tipo_cuenta` (`idTipoCuenta`, `Descripcion`, `Activo`) VALUES (2, 'Corriente', 1);
INSERT INTO `sistemapagotarjeta`.`catalogo_tipo_cuenta` (`idTipoCuenta`, `Descripcion`, `Activo`) VALUES (1, 'Ahorros', 1);

INSERT INTO `sistemapagotarjeta`.`catalogo_tipo_moneda` (`idTipoMoneda`, `Descripcion`, `Simbolo`, `Activo`) VALUES (1, 'Colones', '₡' 1);
INSERT INTO `sistemapagotarjeta`.`catalogo_tipo_moneda` (`idTipoMoneda`, `Descripcion`, `Simbolo`, `Activo`) VALUES (2, 'Dolares', '$', 1);

INSERT INTO `sistemapagotarjeta`.`catalogo_tipo_sucursal` (`idTipoSucursal`, `Descripcion`, `Activo`) VALUES (1, 'Principal', 1);
INSERT INTO `sistemapagotarjeta`.`catalogo_tipo_sucursal` (`idTipoSucursal`, `Descripcion`, `Activo`) VALUES (2, 'Secundario', 1);

INSERT INTO `sistemapagotarjeta`.`sucursal` (`idSucursal`, `Nombre`, `Direccion`, `Activo`, `Fecha_Creacion`, `Fecha_Modificacion`, `catalogo_tipo_sucursal_idTipoSucursal`) VALUES (2, 'DunamysHeredia', 'Heredia Centro', 1, Now(), Now(), 2);
INSERT INTO `sistemapagotarjeta`.`sucursal` (`idSucursal`, `Nombre`, `Direccion`, `Activo`, `Fecha_Creacion`, `Fecha_Modificacion`, `catalogo_tipo_sucursal_idTipoSucursal`) VALUES (1, 'DunamysCentral', 'San Jose Centro', 1, Now(), Now(), 2);
INSERT INTO `sistemapagotarjeta`.`sucursal` (`idSucursal`, `Nombre`, `Direccion`, `Activo`, `Fecha_Creacion`, `Fecha_Modificacion`, `catalogo_tipo_sucursal_idTipoSucursal`) VALUES (3, 'DunamysCartago', 'Cartago Centro', 1, Now(), Now(), 2);

  -- ==========================
-- TABLA SUCURSAL
-- ==========================
ALTER TABLE sistemapagotarjeta.sucursal 
MODIFY COLUMN idSucursal INT NOT NULL AUTO_INCREMENT;

-- ==========================
-- TABLA SERVICIO
-- ==========================
ALTER TABLE sistemapagotarjeta.servicio 
MODIFY COLUMN idServicio INT NOT NULL AUTO_INCREMENT;

-- ==========================
-- TABLAS YA AUTO_INCREMENT PERO RECONFIRMADAS
-- ==========================
ALTER TABLE sistemapagotarjeta.Persona 
MODIFY COLUMN idPersona INT NOT NULL AUTO_INCREMENT;

ALTER TABLE sistemapagotarjeta.Usuario 
MODIFY COLUMN idUsuario INT NOT NULL AUTO_INCREMENT;

ALTER TABLE sistemapagotarjeta.autorizacion 
MODIFY COLUMN idAutorizacion INT NOT NULL AUTO_INCREMENT;

ALTER TABLE sistemapagotarjeta.bitacora 
MODIFY COLUMN idBitacora INT NOT NULL AUTO_INCREMENT;

ALTER TABLE sistemapagotarjeta.notificacion 
MODIFY COLUMN idNotificacion INT NOT NULL AUTO_INCREMENT;

ALTER TABLE sistemapagotarjeta.pago 
MODIFY COLUMN idPago INT NOT NULL AUTO_INCREMENT;

ALTER TABLE sistemapagotarjeta.reporte_transaccion 
MODIFY COLUMN idReporte INT NOT NULL AUTO_INCREMENT;

ALTER TABLE sistemapagotarjeta.reverso_devolucion 
MODIFY COLUMN idReverso INT NOT NULL AUTO_INCREMENT;

ALTER TABLE sistemapagotarjeta.tarjeta 
MODIFY COLUMN idTarjeta INT NOT NULL AUTO_INCREMENT;

ALTER TABLE sistemapagotarjeta.transaccion 
MODIFY COLUMN idTransaccion INT NOT NULL AUTO_INCREMENT;
  
  Use sistemapagotarjeta

-- 1. Quitar la PK actual basada en NumeroCuenta
ALTER TABLE cuenta
DROP PRIMARY KEY;

-- 2. Renombrar NumeroCuenta → idCuenta
ALTER TABLE cuenta
CHANGE COLUMN NumeroCuenta idCuenta INT NOT NULL;

-- 3. Hacer idCuenta AUTO_INCREMENT y PK
ALTER TABLE cuenta
MODIFY COLUMN idCuenta INT NOT NULL AUTO_INCREMENT,
ADD PRIMARY KEY (idCuenta);

-- 4. Crear el nuevo atributo NumeroCuenta (VARCHAR como antes)
ALTER TABLE cuenta
ADD COLUMN NumeroCuenta VARCHAR(100) NOT NULL AFTER idCuenta;

--EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE

ALTER TABLE transaccion
ADD COLUMN destino VARCHAR(100) NOT NULL;

ALTER TABLE transaccion
ADD COLUMN detalle VARCHAR(100) NOT NULL;

ALTER TABLE servicio
DROP FOREIGN KEY servicio_ibfk_1;

ALTER TABLE servicio
DROP COLUMN idTipoServicio;

DROP TABLE IF EXISTS catalogo_tipo_servicio;

ALTER TABLE servicio
ADD COLUMN Activo BIT(1) NOT NULL DEFAULT 1 AFTER Descripcion;

INSERT INTO `sistemapagotarjeta`.`servicio` (`idServicio`, `Descripcion`, `Activo`) VALUES (1, 'Transferencia', 1);
INSERT INTO `sistemapagotarjeta`.`servicio` (`idServicio`, `Descripcion`, `Activo`) VALUES (2, 'Pago de Servicio', 1);
INSERT INTO `sistemapagotarjeta`.`servicio` (`idServicio`, `Descripcion`, `Activo`) VALUES (3, 'Compra en Comercio', 1);

INSERT INTO `sistemapagotarjeta`.`catalogo_metodo_pago` (`idMetodoPago`, `Descripcion`, `Activo`) VALUES (1, 'Por Tarjeta', 1);

INSERT INTO `sistemapagotarjeta`.`catalogo_tipo_transaccion` (`idTipoTransaccion`, `Descripcion`, `Activo`) VALUES (1,'comercial', 1);
INSERT INTO `sistemapagotarjeta`.`catalogo_tipo_transaccion` (`idTipoTransaccion`, `Descripcion`, `Activo`) VALUES (2, 'financiero', 1);

INSERT INTO `sistemapagotarjeta`.`catalogo_estado_transaccion` (`idEstadoTransaccion`, `Descripcion`, `Activo`) VALUES (1, 'Aprobada', 1);
INSERT INTO `sistemapagotarjeta`.`catalogo_estado_transaccion` (`idEstadoTransaccion`, `Descripcion`, `Activo`) VALUES (2, 'Denegada', 1);
