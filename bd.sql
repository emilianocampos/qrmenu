-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         10.4.6-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.21.0.7344
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para mx_52592
CREATE DATABASE IF NOT EXISTS `mx_52592` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `mx_52592`;

-- Volcando estructura para función mx_52592.CalDemora
DELIMITER //
CREATE FUNCTION `CalDemora`(Ent CHAR(5), Sal CHAR(5)) RETURNS char(4) CHARSET latin1
BEGIN
				 DECLARE retorno char(4);
				 DECLARE xx1 INT(4);
				 DECLARE Tim INT (4);
				 set Ent = LEFT(Ent, 5);
				 set Sal = LEFT(Sal, 5);
				 set xx1 = CAST(LEFT(Ent, 2) * 60 + CAST(SUBSTR(Ent, 4, 2) AS unsigned) AS unsigned);
				 set Tim = IF(Sal < Ent, (CAST(LEFT(Sal, 2) AS unsigned)+24) * 60 + CAST(SUBSTR(Sal, 4, 2) AS unsigned), CAST(LEFT(Sal, 2) AS unsigned) * 60 + CAST(SUBSTR(Sal, 4, 2) AS unsigned));
				 set retorno = CONVERT((Tim - xx1), char(4));
				 RETURN retorno;
			END//
DELIMITER ;

-- Volcando estructura para función mx_52592.DispCpb
DELIMITER //
CREATE FUNCTION `DispCpb`(`FFNom` CHAR(1),`FFPre` INT(4),`FFNum` INT(8),`FFIdComp` CHAR(15)) RETURNS char(18) CHARSET latin1
BEGIN
			  declare retorno char(18);
			  declare FFTipCpb char(3);
			  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET retorno = '                  ';
			  case FFNom
			    when '-' then set FFTipCpb = 'ND ';
			        when '+' then set FFTipCpb = 'NC ';
			        when 'R' then set FFTipCpb = 'Rem';
			        when 'S' then set FFTipCpb = 'Res';
			       when 'P' then set FFTipCpb = 'Pag';
			        when 'Z' then set FFTipCpb = 'Tic';
			    else
			      begin 
			        set FFTipCpb = concat('Fc', FFNom);
			      end;
			  end case;
			  if FFIdComp = '' then 
			    set retorno = concat(FFTipCpb, ' ', LPAD(FFPre, 4, '0'), '-', LPAD(FFNum, 8, '0'), '     ');
			  else
			    set retorno = concat(FFTipCpb, lpad(trim(FFIdComp), 15, '.'));
			 end if; 
			    RETURN retorno;
			END//
DELIMITER ;

-- Volcando estructura para función mx_52592.DispCpbFac
DELIMITER //
CREATE FUNCTION `DispCpbFac`(`FFNom` CHAR(1),`FFPre` INT(4),`FFNum` INT(8),`FFCodLoc` Int(3)) RETURNS char(18) CHARSET latin1
BEGIN
			  declare retorno char(18);
			  declare FFTipCpb char(3);
			  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET retorno = '                  ';
			  set FFTipCpb = (select ifnull(mxvar.valor1, '') as valor1
			                    from mxcpb
			                    left join mxvar on left(trim(mxvar.nombre), 11) = left(trim(replace(replace(mxcpb.valor,'ELECTRÓNICA', ''), 'FISCAL', '')), 11) 
			                    where  mxcpb.y = .1 and mxcpb.codigo = FFNom limit 1);
			  if FFCodLoc = 0 then 
			    set retorno = concat(FFTipCpb, ' ', LPAD(FFPre, 4, '0'), '-', LPAD(FFNum, 8, '0'));
			  else
			    set retorno = concat(FFTipCpb, ' ', LPAD(FFCodLoc, 3, '0'), '-', LPAD(FFPre, 4, '0'), '-', LPAD(FFNum, 8, '0'));
			  end if; 
			    RETURN retorno;
			END//
DELIMITER ;

-- Volcando estructura para función mx_52592.DispTur
DELIMITER //
CREATE FUNCTION `DispTur`(`Ttur` CHAR(1)) RETURNS char(20) CHARSET latin1
BEGIN
				declare retorno char(20);
				CASE Ttur
					WHEN '1' THEN SET retorno = (SELECT Turno1 FROM MXPAE);
			   	WHEN '2' THEN SET retorno = (SELECT Turno2 FROM MXPAE);
			   	WHEN '3' THEN SET retorno = (SELECT Turno3 FROM MXPAE);
					else
						begin
							set retorno = '';
						end;
				end case;
				RETURN retorno;
			END//
DELIMITER ;

-- Volcando estructura para tabla mx_52592.mxacc
CREATE TABLE IF NOT EXISTS `mxacc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(20) NOT NULL DEFAULT '',
  `modulo` char(30) NOT NULL DEFAULT '',
  `nombre` char(70) NOT NULL DEFAULT '',
  `cod_cla` int(2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `COD_CLA` (`cod_cla`),
  KEY `REG` (`modulo`,`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxadi
CREATE TABLE IF NOT EXISTS `mxadi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `cantidad` decimal(11,3) NOT NULL DEFAULT 0.000,
  `cod_art` decimal(10,0) NOT NULL DEFAULT 0,
  `nombre` char(60) NOT NULL DEFAULT '',
  `precio` decimal(16,2) NOT NULL DEFAULT 0.00,
  `detalle` char(100) NOT NULL DEFAULT '',
  `pre_fus` decimal(16,2) NOT NULL DEFAULT 0.00,
  `can_fus` decimal(11,3) NOT NULL DEFAULT 0.000,
  `cod_rua` int(5) NOT NULL DEFAULT 0,
  `agregados` char(100) NOT NULL DEFAULT '',
  `sacados` char(100) NOT NULL DEFAULT '',
  `texto` char(100) NOT NULL DEFAULT '',
  `hora` char(10) NOT NULL DEFAULT '',
  `hora_chk` char(10) NOT NULL DEFAULT '',
  `cant_chk` int(3) NOT NULL DEFAULT 0,
  `cod_comanda` char(2) NOT NULL DEFAULT '',
  `nro_comanda` int(6) NOT NULL DEFAULT 0,
  `nro_comanda2` int(6) NOT NULL DEFAULT 0,
  `nro_comanda3` int(6) NOT NULL DEFAULT 0,
  `orden` int(2) NOT NULL DEFAULT 0,
  `padre` int(2) NOT NULL DEFAULT 0,
  `hijo` int(2) NOT NULL DEFAULT 0,
  `tipo_rel` char(2) NOT NULL DEFAULT '',
  `tildado` bit(1) NOT NULL DEFAULT b'0',
  `rel_mvs` mediumtext NOT NULL DEFAULT '',
  `puntos` int(6) NOT NULL DEFAULT 0,
  `comenzal` int(3) NOT NULL DEFAULT 0,
  `cod_dto` int(2) NOT NULL DEFAULT 0,
  `imp_dto` decimal(16,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_ART` (`cod_art`),
  KEY `COD_RUA` (`cod_rua`),
  KEY `COD_COMANDA` (`cod_comanda`),
  KEY `ORDEN` (`orden`),
  KEY `COD_DTO` (`cod_dto`),
  KEY `CTVMESORD` (`cod_ctv`,`mesa`,`orden`)
) ENGINE=InnoDB AUTO_INCREMENT=45710 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxadirel
CREATE TABLE IF NOT EXISTS `mxadirel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_rel` int(11) NOT NULL DEFAULT 0,
  `id_android` int(6) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `hora` char(5) NOT NULL DEFAULT '',
  `id_equipo` char(20) NOT NULL DEFAULT '',
  `chk` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxage
CREATE TABLE IF NOT EXISTS `mxage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `hora` char(10) NOT NULL DEFAULT '',
  `para` int(3) NOT NULL DEFAULT 0,
  `asunto` char(40) NOT NULL DEFAULT '',
  `mensaje` mediumtext NOT NULL DEFAULT '',
  `estado` char(2) NOT NULL DEFAULT '',
  `modo` int(1) NOT NULL DEFAULT 0,
  `ult_act` date NOT NULL DEFAULT '0000-00-00',
  PRIMARY KEY (`id`),
  KEY `COD_USU` (`cod_usu`),
  KEY `FECHA` (`fecha`),
  KEY `FECHOR` (`fecha`,`hora`),
  KEY `PAREST` (`para`,`estado`,`fecha`,`hora`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxagg
CREATE TABLE IF NOT EXISTS `mxagg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` char(60) NOT NULL DEFAULT '',
  `direccion` char(100) NOT NULL DEFAULT '',
  `localidad` char(40) NOT NULL DEFAULT '',
  `telefono` char(40) NOT NULL DEFAULT '',
  `fax` char(40) NOT NULL DEFAULT '',
  `e_mail` char(60) NOT NULL DEFAULT '',
  `nota` mediumtext NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxapc
CREATE TABLE IF NOT EXISTS `mxapc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cuenta` char(40) NOT NULL DEFAULT '',
  `tipo` char(2) NOT NULL DEFAULT '',
  `nom_campo` char(30) NOT NULL DEFAULT '',
  `destino` char(30) NOT NULL DEFAULT '',
  `cod_dato` char(30) NOT NULL DEFAULT '',
  `nom_dato` char(60) NOT NULL DEFAULT '',
  `debhab` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `COD_CUENTA` (`cod_cuenta`),
  KEY `COD_DATO` (`cod_dato`),
  KEY `TBASECOD` (`tipo`,`destino`,`cod_dato`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxape
CREATE TABLE IF NOT EXISTS `mxape` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `comandas` bit(1) NOT NULL DEFAULT b'0',
  `nombre` char(20) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `cod_call` char(8) NOT NULL DEFAULT '',
  `web` bit(1) NOT NULL DEFAULT b'0',
  `cubiertos` int(3) NOT NULL DEFAULT 0,
  `mozo` int(4) NOT NULL DEFAULT 0,
  `fecha_ape` date NOT NULL DEFAULT '0000-00-00',
  `hora` char(12) NOT NULL DEFAULT '',
  `subtotal` decimal(16,2) NOT NULL DEFAULT 0.00,
  `total` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_dto` int(2) NOT NULL DEFAULT 0,
  `nombre_dto` char(30) NOT NULL DEFAULT '',
  `tipo_dto` char(2) NOT NULL DEFAULT '',
  `valor_dto` decimal(16,2) NOT NULL DEFAULT 0.00,
  `dto_cli` bit(1) NOT NULL DEFAULT b'0',
  `hora_cerr` char(10) NOT NULL DEFAULT '',
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `nombre_cpb` char(20) NOT NULL DEFAULT '',
  `fiscal` bit(1) NOT NULL DEFAULT b'0',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `fecha_fis` date NOT NULL DEFAULT '0000-00-00',
  `hora_fis` char(12) NOT NULL DEFAULT '',
  `transp` int(8) NOT NULL DEFAULT 0,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `nom_cli` char(200) NOT NULL DEFAULT '',
  `ape_cli` char(60) NOT NULL DEFAULT '',
  `tel_cli` char(40) NOT NULL DEFAULT '',
  `dir_cli` char(130) NOT NULL DEFAULT '',
  `obs_cli` char(100) NOT NULL DEFAULT '',
  `iva_cli` char(2) NOT NULL DEFAULT '',
  `cui_cli` char(26) NOT NULL DEFAULT '',
  `nuevo_cli` bit(1) NOT NULL DEFAULT b'0',
  `cmap` char(12) NOT NULL DEFAULT '',
  `repartidor` int(4) NOT NULL DEFAULT 0,
  `repart_nom` char(40) NOT NULL DEFAULT '',
  `hora_rep` char(10) NOT NULL DEFAULT '',
  `tasaiva` decimal(7,2) NOT NULL DEFAULT 0.00,
  `control` bit(1) NOT NULL DEFAULT b'0',
  `nro_ctr` char(26) NOT NULL DEFAULT '',
  `observa` char(80) NOT NULL DEFAULT '',
  `hora_ent` char(10) NOT NULL DEFAULT '',
  `fecha_ent` date NOT NULL DEFAULT '0000-00-00',
  `turno_ent` char(2) NOT NULL DEFAULT '',
  `paga_con` decimal(16,2) NOT NULL DEFAULT 0.00,
  `postre` bit(1) NOT NULL DEFAULT b'0',
  `cod_for1` char(2) NOT NULL DEFAULT '',
  `cod_for2` char(2) NOT NULL DEFAULT '',
  `cod_for3` char(2) NOT NULL DEFAULT '',
  `cod_for4` char(2) NOT NULL DEFAULT '',
  `cod_for5` char(2) NOT NULL DEFAULT '',
  `cod_for6` char(2) NOT NULL DEFAULT '',
  `imp1` decimal(16,2) NOT NULL DEFAULT 0.00,
  `imp2` decimal(16,2) NOT NULL DEFAULT 0.00,
  `imp3` decimal(16,2) NOT NULL DEFAULT 0.00,
  `imp4` decimal(16,2) NOT NULL DEFAULT 0.00,
  `imp5` decimal(16,2) NOT NULL DEFAULT 0.00,
  `imp6` decimal(16,2) NOT NULL DEFAULT 0.00,
  `det_for` mediumtext NOT NULL DEFAULT '',
  `id_pape` int(11) NOT NULL DEFAULT 0,
  `tot_per` decimal(16,2) NOT NULL DEFAULT 0.00,
  `adicionada` bit(1) NOT NULL DEFAULT b'0',
  `lista` char(2) NOT NULL DEFAULT '',
  `botgrupo` int(2) NOT NULL DEFAULT 0,
  `reserva` decimal(10,0) NOT NULL DEFAULT 0,
  `estado` char(2) NOT NULL DEFAULT '',
  `ulthor` char(10) NOT NULL DEFAULT '',
  `sena` decimal(16,2) NOT NULL DEFAULT 0.00,
  `formacobro` char(4) NOT NULL DEFAULT '',
  `aviso` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `PEDIDO` (`cod_ctv`,`mesa`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `NOMBRE` (`nombre`),
  KEY `COD_CALL` (`cod_call`),
  KEY `MOZO` (`mozo`),
  KEY `COD_DTO` (`cod_dto`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `REPARTIDOR` (`repartidor`),
  KEY `FECHA_ENT` (`fecha_ent`),
  KEY `COD_FOR1` (`cod_for1`),
  KEY `COD_FOR2` (`cod_for2`),
  KEY `COD_FOR3` (`cod_for3`),
  KEY `COD_FOR4` (`cod_for4`),
  KEY `COD_FOR5` (`cod_for5`),
  KEY `COD_FOR6` (`cod_for6`),
  KEY `RESERVA` (`reserva`),
  KEY `MESA` (`cod_ctv`,`mesa`)
) ENGINE=InnoDB AUTO_INCREMENT=15749 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxapp
CREATE TABLE IF NOT EXISTS `mxapp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(5) NOT NULL,
  `nombre` char(40) NOT NULL DEFAULT '',
  `tipo` int(1) NOT NULL DEFAULT 1,
  `cod_partner` int(5) NOT NULL DEFAULT 0,
  `idkey` char(50) NOT NULL DEFAULT '',
  `token` char(80) NOT NULL DEFAULT '',
  `url` char(150) NOT NULL DEFAULT '',
  `date_create` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `date_update` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `COD_PARTNER` (`cod_partner`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxappnoti
CREATE TABLE IF NOT EXISTS `mxappnoti` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_app` int(5) NOT NULL DEFAULT 0,
  `cod_noti` int(4) NOT NULL DEFAULT 0,
  `date_create` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `date_update` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `COD_APP` (`cod_app`),
  KEY `COD_NOTI` (`cod_noti`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxarc
CREATE TABLE IF NOT EXISTS `mxarc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(60) NOT NULL DEFAULT '',
  `nombre` char(140) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxarec
CREATE TABLE IF NOT EXISTS `mxarec` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(3) NOT NULL DEFAULT 0,
  `nombre` char(40) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxarecp
CREATE TABLE IF NOT EXISTS `mxarecp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_arec` int(3) NOT NULL DEFAULT 0,
  `cod_per` char(6) NOT NULL DEFAULT '',
  `valor1` decimal(12,2) NOT NULL DEFAULT 0.00,
  `valor2` decimal(12,2) NOT NULL DEFAULT 0.00,
  `valor3` decimal(12,2) NOT NULL DEFAULT 0.00,
  `valor4` char(40) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_AREC` (`cod_arec`),
  KEY `COD_PER` (`cod_per`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxart
CREATE TABLE IF NOT EXISTS `mxart` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(5) NOT NULL DEFAULT 0,
  `codid` char(30) NOT NULL DEFAULT '',
  `nombre` char(120) NOT NULL DEFAULT '',
  `descripc` char(255) NOT NULL DEFAULT '',
  `nombre_fac` char(100) NOT NULL DEFAULT '',
  `bot_grupo` int(2) NOT NULL DEFAULT 0,
  `cod_rua` int(3) NOT NULL DEFAULT 0,
  `cod_sua` int(3) NOT NULL DEFAULT 0,
  `tipo_adic` char(4) NOT NULL DEFAULT '',
  `unidades` decimal(11,3) NOT NULL DEFAULT 0.000,
  `opc_menu` mediumtext NOT NULL DEFAULT '',
  `costo` decimal(17,3) NOT NULL DEFAULT 0.000,
  `precio1` decimal(16,2) NOT NULL DEFAULT 0.00,
  `precio2` decimal(16,2) NOT NULL DEFAULT 0.00,
  `precio3` decimal(16,2) NOT NULL DEFAULT 0.00,
  `precio4` decimal(16,2) NOT NULL DEFAULT 0.00,
  `media` bit(1) NOT NULL DEFAULT b'0',
  `precio1m` decimal(16,2) NOT NULL DEFAULT 0.00,
  `precio2m` decimal(16,2) NOT NULL DEFAULT 0.00,
  `precio3m` decimal(16,2) NOT NULL DEFAULT 0.00,
  `precio4m` decimal(16,2) NOT NULL DEFAULT 0.00,
  `especifica` bit(1) NOT NULL DEFAULT b'0',
  `comanda1` char(2) NOT NULL DEFAULT '',
  `comanda2` char(2) NOT NULL DEFAULT '',
  `comanda3` char(2) NOT NULL DEFAULT '',
  `bot_nombre` char(40) NOT NULL DEFAULT '',
  `bot_fila` int(2) NOT NULL DEFAULT 0,
  `bot_colum` int(2) NOT NULL DEFAULT 0,
  `bot_color` int(8) NOT NULL DEFAULT 0,
  `bot_fuente` char(60) NOT NULL DEFAULT '',
  `bot_ancho` int(3) NOT NULL DEFAULT 0,
  `bot_alto` int(3) NOT NULL DEFAULT 0,
  `porciones` decimal(10,3) NOT NULL DEFAULT 0.000,
  `dep_desc` char(2) NOT NULL DEFAULT '',
  `cod_iva` char(2) NOT NULL DEFAULT '',
  `imp_int` decimal(16,2) NOT NULL DEFAULT 0.00,
  `receta` mediumtext NOT NULL DEFAULT '',
  `no_agrupa` bit(1) NOT NULL DEFAULT b'0',
  `discont` bit(1) NOT NULL DEFAULT b'0',
  `foto` char(255) NOT NULL DEFAULT '',
  `nivel` int(1) NOT NULL DEFAULT 0,
  `tiempo` int(2) NOT NULL DEFAULT 0,
  `observa` mediumtext NOT NULL DEFAULT '',
  `autofusion` bit(1) NOT NULL DEFAULT b'0',
  `eve_for` char(12) NOT NULL DEFAULT '',
  `eve_form` char(12) NOT NULL DEFAULT '',
  `eve_formh` char(12) NOT NULL DEFAULT '',
  `sinstock` bit(1) NOT NULL DEFAULT b'0',
  `usastock` bit(1) NOT NULL DEFAULT b'0',
  `cantstk` int(3) NOT NULL DEFAULT 0,
  `contstock` bit(1) NOT NULL DEFAULT b'0',
  `prereceta` char(14) NOT NULL DEFAULT '',
  `kcal` decimal(14,2) NOT NULL DEFAULT 0.00,
  `hidratos` decimal(14,2) NOT NULL DEFAULT 0.00,
  `proteinas` decimal(14,2) NOT NULL DEFAULT 0.00,
  `lipidos` decimal(14,2) NOT NULL DEFAULT 0.00,
  `dias_vto` int(4) NOT NULL DEFAULT 0,
  `texto1` char(64) NOT NULL DEFAULT '',
  `texto2` char(64) NOT NULL DEFAULT '',
  `texto3` char(64) NOT NULL DEFAULT '',
  `texto4` char(64) NOT NULL DEFAULT '',
  `texto5` char(64) NOT NULL DEFAULT '',
  `puntocanj` int(7) NOT NULL DEFAULT 0,
  `sectorelab` int(3) NOT NULL DEFAULT 0,
  `excl_dto` int(2) NOT NULL DEFAULT 0,
  `modobarra` char(2) NOT NULL DEFAULT '',
  `deliact` bit(1) NOT NULL DEFAULT b'0',
  `fec_mod` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `fotoblob` blob NOT NULL DEFAULT '',
  `fecha_update` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `CODID` (`codid`),
  KEY `NOMBRE` (`nombre`),
  KEY `COD_RUA` (`cod_rua`),
  KEY `COD_SUA` (`cod_sua`),
  KEY `DEP_DESC` (`dep_desc`),
  KEY `COD_IVA` (`cod_iva`),
  KEY `BOTONES` (`bot_grupo`,`bot_fila`,`bot_colum`),
  KEY `FECHA_UPDATE` (`fecha_update`)
) ENGINE=InnoDB AUTO_INCREMENT=269 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxartcb
CREATE TABLE IF NOT EXISTS `mxartcb` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `cod_bar` char(15) NOT NULL DEFAULT '',
  `descripcion` char(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_ART` (`cod_art`),
  KEY `COD_BAR` (`cod_bar`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxasi
CREATE TABLE IF NOT EXISTS `mxasi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ejercicio` int(3) NOT NULL DEFAULT 0,
  `asiento` int(6) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `concepto` char(100) NOT NULL DEFAULT '',
  `cod_pla` char(40) NOT NULL DEFAULT '',
  `importe` decimal(17,3) NOT NULL DEFAULT 0.000,
  `observacion` char(100) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `cto_gasto` int(5) NOT NULL DEFAULT 0,
  `tipo` char(2) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `COD_PLA` (`cod_pla`),
  KEY `PREFIJO` (`prefijo`),
  KEY `EJEFECASI` (`ejercicio`,`fecha`,`asiento`),
  KEY `EJEASI` (`ejercicio`,`asiento`),
  KEY `FECCTA` (`fecha`,`cod_pla`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxaud
CREATE TABLE IF NOT EXISTS `mxaud` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `turno` char(2) NOT NULL DEFAULT '',
  `hora_ape` char(10) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `detalle` mediumtext NOT NULL DEFAULT '',
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `idfint` decimal(10,0) NOT NULL DEFAULT 0,
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `TURNO` (`turno`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_USU` (`cod_usu`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `NUMERO3` (`numero3`),
  KEY `ENVIO` (`envio`)
) ENGINE=InnoDB AUTO_INCREMENT=17101 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxaudtemp
CREATE TABLE IF NOT EXISTS `mxaudtemp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `hora` char(5) NOT NULL,
  `ape_id` int(11) DEFAULT NULL,
  `detalle` mediumtext NOT NULL,
  `cod_usu` int(4) NOT NULL,
  `cod_ter` int(4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `APE_ID` (`ape_id`),
  KEY `COD_USU` (`cod_usu`),
  KEY `COD_TER` (`cod_ter`)
) ENGINE=InnoDB AUTO_INCREMENT=20226 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxaut
CREATE TABLE IF NOT EXISTS `mxaut` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(40) NOT NULL DEFAULT '',
  `p1funcion` char(20) NOT NULL DEFAULT '',
  `p2archivo` char(10) NOT NULL DEFAULT '',
  `p3ubicacion` char(200) NOT NULL DEFAULT '',
  `p4periodo` int(1) NOT NULL DEFAULT 0,
  `p4desde` char(20) NOT NULL DEFAULT '',
  `p4hasta` char(20) NOT NULL DEFAULT '',
  `p5acero` int(1) NOT NULL DEFAULT 0,
  `p5aexcel` int(1) NOT NULL DEFAULT 0,
  `p5zip` int(1) NOT NULL DEFAULT 0,
  `p5modorecu` int(1) NOT NULL DEFAULT 0,
  `p5actstock` int(1) NOT NULL DEFAULT 0,
  `ultenvio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxauth
CREATE TABLE IF NOT EXISTS `mxauth` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `detalle` mediumtext NOT NULL DEFAULT '',
  `crc` char(245) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxayuda
CREATE TABLE IF NOT EXISTS `mxayuda` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_modulo` int(4) NOT NULL DEFAULT 0,
  `detalle` mediumtext NOT NULL DEFAULT '',
  `fecha_up` char(46) NOT NULL DEFAULT '',
  `fecha` char(46) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_MODULO` (`cod_modulo`),
  KEY `FECHA_UP` (`fecha_up`),
  KEY `FECHA` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxayudam
CREATE TABLE IF NOT EXISTS `mxayudam` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(4) NOT NULL DEFAULT 0,
  `nombre` char(200) NOT NULL DEFAULT '',
  `parent` int(4) NOT NULL DEFAULT 0,
  `nom_form` char(40) NOT NULL DEFAULT '',
  `orden` int(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `PARENT` (`parent`),
  KEY `NOM_FORM` (`nom_form`),
  KEY `ORDEN` (`orden`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxban
CREATE TABLE IF NOT EXISTS `mxban` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(40) NOT NULL DEFAULT '',
  `direccion` char(60) NOT NULL DEFAULT '',
  `sucursal` char(40) NOT NULL DEFAULT '',
  `telefono` char(40) NOT NULL DEFAULT '',
  `nro_cheque` decimal(10,0) NOT NULL DEFAULT 0,
  `cpb_cheque` char(2) NOT NULL DEFAULT '',
  `cta_cont` char(24) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxbigg
CREATE TABLE IF NOT EXISTS `mxbigg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `coleccion` char(80) NOT NULL,
  `fecha` date NOT NULL,
  `idfint` int(10) DEFAULT NULL,
  `procesado` int(1) NOT NULL,
  `reproceso` int(1) NOT NULL,
  `date_create` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `COLECCION` (`coleccion`),
  KEY `FECHA` (`fecha`),
  KEY `PROCESADO` (`procesado`)
) ENGINE=InnoDB AUTO_INCREMENT=766 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxbloqueo
CREATE TABLE IF NOT EXISTS `mxbloqueo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tabla` char(20) NOT NULL DEFAULT '',
  `procid` int(4) NOT NULL DEFAULT 0,
  `id_bloq` int(11) NOT NULL DEFAULT 0,
  `cod_usu` int(5) NOT NULL DEFAULT 0,
  `cod_ter` int(3) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `BLOQUEO` (`tabla`,`id_bloq`),
  KEY `PROCID` (`procid`),
  KEY `TABLA` (`tabla`)
) ENGINE=InnoDB AUTO_INCREMENT=114279 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcae
CREATE TABLE IF NOT EXISTS `mxcae` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cuit` char(26) NOT NULL DEFAULT '',
  `total` decimal(16,2) NOT NULL DEFAULT 0.00,
  `neto` decimal(16,2) NOT NULL DEFAULT 0.00,
  `total_conc` decimal(16,2) NOT NULL DEFAULT 0.00,
  `iva_insc` decimal(16,2) NOT NULL DEFAULT 0.00,
  `iva_noinsc` decimal(16,2) NOT NULL DEFAULT 0.00,
  `exento` decimal(16,2) NOT NULL DEFAULT 0.00,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `fecha_vto` date NOT NULL DEFAULT '0000-00-00',
  `fecha_desde` date NOT NULL DEFAULT '0000-00-00',
  `fecha_hasta` date NOT NULL DEFAULT '0000-00-00',
  `id_sesion` decimal(12,0) NOT NULL DEFAULT 0,
  `respuesta` char(2) NOT NULL DEFAULT '',
  `cae` decimal(14,0) NOT NULL DEFAULT 0,
  `cod_mensaje` char(4) NOT NULL DEFAULT '',
  `txt_mensaje` mediumtext NOT NULL DEFAULT '',
  `cpb_afip` char(6) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `tipocfe` int(3) NOT NULL DEFAULT 0,
  `serie` char(2) NOT NULL DEFAULT '',
  `cae_desde` int(7) NOT NULL DEFAULT 0,
  `cae_hasta` int(7) NOT NULL DEFAULT 0,
  `hash` char(6) NOT NULL DEFAULT '',
  `numcfe` int(7) NOT NULL DEFAULT 0,
  `neto1` decimal(14,2) NOT NULL DEFAULT 0.00,
  `tasa1` decimal(5,2) NOT NULL DEFAULT 0.00,
  `iva1` decimal(14,2) NOT NULL DEFAULT 0.00,
  `neto2` decimal(14,2) NOT NULL DEFAULT 0.00,
  `tasa2` decimal(5,2) NOT NULL DEFAULT 0.00,
  `iva2` decimal(14,2) NOT NULL DEFAULT 0.00,
  `neto3` decimal(14,2) NOT NULL DEFAULT 0.00,
  `tasa3` decimal(5,2) NOT NULL DEFAULT 0.00,
  `iva3` decimal(14,2) NOT NULL DEFAULT 0.00,
  `percepcion` decimal(14,2) NOT NULL DEFAULT 0.00,
  `imp_int` decimal(14,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `FECHA` (`fecha`),
  KEY `CAE` (`cae`),
  KEY `COD_MENSAJE` (`cod_mensaje`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`),
  KEY `REG2` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`)
) ENGINE=InnoDB AUTO_INCREMENT=8376 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcaj
CREATE TABLE IF NOT EXISTS `mxcaj` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `numero` int(2) NOT NULL DEFAULT 0,
  `detalle` char(70) NOT NULL DEFAULT '',
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tipo` char(4) NOT NULL DEFAULT '',
  `referencia` char(36) NOT NULL DEFAULT '',
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `idfint` decimal(10,0) NOT NULL DEFAULT 0,
  `id_ant` int(11) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `NUMERO` (`numero`),
  KEY `REFERENCIA` (`referencia`),
  KEY `COD_USU` (`cod_usu`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `PREFIJO` (`prefijo`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`fecha`,`turno`,`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcal
CREATE TABLE IF NOT EXISTS `mxcal` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(4) NOT NULL DEFAULT 0,
  `nombre` char(100) NOT NULL DEFAULT '',
  `sectores` mediumtext NOT NULL DEFAULT '',
  `mapa` int(2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `MAPCOD` (`mapa`,`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcat
CREATE TABLE IF NOT EXISTS `mxcat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(6) NOT NULL DEFAULT '',
  `nombre` char(60) NOT NULL DEFAULT '',
  `tipo` char(2) NOT NULL DEFAULT '',
  `nivel` int(1) NOT NULL DEFAULT 0,
  `p1` char(40) NOT NULL DEFAULT '',
  `p2` char(40) NOT NULL DEFAULT '',
  `p3` char(40) NOT NULL DEFAULT '',
  `p4` char(40) NOT NULL DEFAULT '',
  `p5` char(40) NOT NULL DEFAULT '',
  `p6` char(40) NOT NULL DEFAULT '',
  `p7` char(40) NOT NULL DEFAULT '',
  `p8` char(40) NOT NULL DEFAULT '',
  `p9` char(40) NOT NULL DEFAULT '',
  `p10` char(40) NOT NULL DEFAULT '',
  `p11` char(40) NOT NULL DEFAULT '',
  `p12` char(40) NOT NULL DEFAULT '',
  `p90` char(40) NOT NULL DEFAULT '',
  `p91` char(40) NOT NULL DEFAULT '',
  `p92` char(40) NOT NULL DEFAULT '',
  `p93` char(40) NOT NULL DEFAULT '',
  `p94` char(40) NOT NULL DEFAULT '',
  `p95` char(40) NOT NULL DEFAULT '',
  `p96` char(40) NOT NULL DEFAULT '',
  `p97` char(40) NOT NULL DEFAULT '',
  `p99` char(40) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcba
CREATE TABLE IF NOT EXISTS `mxcba` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(40) NOT NULL DEFAULT '',
  `tipo` char(2) NOT NULL DEFAULT '',
  `cod_pro` int(5) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `COD_PRO` (`cod_pro`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcga
CREATE TABLE IF NOT EXISTS `mxcga` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(3) NOT NULL DEFAULT 0,
  `nombre` char(60) NOT NULL DEFAULT '',
  `tipo` char(2) NOT NULL DEFAULT '',
  `cod_rga` int(2) NOT NULL DEFAULT 0,
  `cod_imp` char(16) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `COD_RGA` (`cod_rga`),
  KEY `COD_IMP` (`cod_imp`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcjm
CREATE TABLE IF NOT EXISTS `mxcjm` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(6) NOT NULL DEFAULT '',
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `numero` int(3) NOT NULL DEFAULT 0,
  `detalle` char(100) NOT NULL DEFAULT '',
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `saldo` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tipo` char(4) NOT NULL DEFAULT '',
  `referencia` char(36) NOT NULL DEFAULT '',
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `FECHA` (`fecha`),
  KEY `NUMERO` (`numero`),
  KEY `REFERENCIA` (`referencia`),
  KEY `COD_USU` (`cod_usu`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `PREFIJO` (`prefijo`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`fecha`,`numero`),
  KEY `REG2` (`fecha`,`numero`,`cod_suc`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcla
CREATE TABLE IF NOT EXISTS `mxcla` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(20) NOT NULL DEFAULT '',
  `clave` char(30) NOT NULL DEFAULT '',
  `nivel` int(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `CLAVE` (`clave`),
  KEY `NIVEL` (`nivel`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcle
CREATE TABLE IF NOT EXISTS `mxcle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `estado` char(6) NOT NULL DEFAULT '',
  `fec_est` date NOT NULL DEFAULT '0000-00-00',
  `prox_est` char(6) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `ESTADO` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcli
CREATE TABLE IF NOT EXISTS `mxcli` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(7) NOT NULL DEFAULT 0,
  `nombre` char(50) NOT NULL DEFAULT '',
  `apellido` char(50) NOT NULL DEFAULT '',
  `razon` char(70) NOT NULL DEFAULT '',
  `dni` char(16) NOT NULL DEFAULT '',
  `cod_cal` int(4) NOT NULL DEFAULT 0,
  `cod_map` int(2) NOT NULL DEFAULT 0,
  `calle` char(100) NOT NULL DEFAULT '',
  `altura` char(10) NOT NULL DEFAULT '',
  `pisodto` char(20) NOT NULL DEFAULT '',
  `entre1` char(100) NOT NULL DEFAULT '',
  `entre2` char(100) NOT NULL DEFAULT '',
  `sector` char(200) NOT NULL DEFAULT '',
  `telefono` char(40) NOT NULL DEFAULT '',
  `celular` char(40) NOT NULL DEFAULT '',
  `localidad` char(30) NOT NULL DEFAULT '',
  `foto` char(255) NOT NULL DEFAULT '',
  `cod_postal` char(16) NOT NULL DEFAULT '',
  `provincia` char(30) NOT NULL DEFAULT '',
  `geoloc` char(100) NOT NULL DEFAULT '',
  `e_mail` char(80) NOT NULL DEFAULT '',
  `fecha_nac` date NOT NULL DEFAULT '0000-00-00',
  `fecha_ing` date NOT NULL DEFAULT '0000-00-00',
  `turno_ing` char(2) NOT NULL DEFAULT '',
  `categoria` char(6) NOT NULL DEFAULT '',
  `cod_dto` int(2) NOT NULL DEFAULT 0,
  `tipo_iva` char(2) NOT NULL DEFAULT '',
  `cuit` char(70) NOT NULL DEFAULT '',
  `observac` char(100) NOT NULL DEFAULT '',
  `detalles` mediumtext NOT NULL DEFAULT '',
  `vtas_acum` int(4) NOT NULL DEFAULT 0,
  `impo_acum` decimal(16,2) NOT NULL DEFAULT 0.00,
  `fecha_parc` date NOT NULL DEFAULT '0000-00-00',
  `vtas_parc` int(4) NOT NULL DEFAULT 0,
  `impo_parc` decimal(16,2) NOT NULL DEFAULT 0.00,
  `bloq_cred` bit(1) NOT NULL DEFAULT b'0',
  `tope_cred` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cpb_defa` char(2) NOT NULL DEFAULT '',
  `texto1` char(60) NOT NULL DEFAULT '',
  `texto2` char(60) NOT NULL DEFAULT '',
  `texto3` char(60) NOT NULL DEFAULT '',
  `puntos` int(7) NOT NULL DEFAULT 0,
  `cod_tarj` char(200) NOT NULL DEFAULT '',
  `zona` int(3) NOT NULL DEFAULT 0,
  `sinc` bit(1) NOT NULL DEFAULT b'0',
  `cod_unif` int(7) NOT NULL DEFAULT 0,
  `sinc_bd` bit(1) NOT NULL DEFAULT b'0',
  `conyuge` char(60) NOT NULL DEFAULT '',
  `fotoblob` blob NOT NULL DEFAULT '',
  `aliascbu` char(20) NOT NULL DEFAULT '',
  `pais` int(3) NOT NULL DEFAULT 0,
  `cod_doc` int(3) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `APELLIDO` (`apellido`),
  KEY `RAZON` (`razon`),
  KEY `DNI` (`dni`),
  KEY `COD_CAL` (`cod_cal`),
  KEY `COD_MAP` (`cod_map`),
  KEY `TELEFONO` (`telefono`),
  KEY `COD_POSTAL` (`cod_postal`),
  KEY `E_MAIL` (`e_mail`),
  KEY `COD_DTO` (`cod_dto`),
  KEY `CUIT` (`cuit`),
  KEY `COD_TARJ` (`cod_tarj`),
  KEY `COD_UNIF` (`cod_unif`),
  KEY `SINC_BD` (`sinc_bd`),
  KEY `CONYUGE` (`conyuge`),
  KEY `BUK` (`nombre`,`e_mail`,`telefono`),
  KEY `DIRECCION` (`calle`,`altura`,`pisodto`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcliper
CREATE TABLE IF NOT EXISTS `mxcliper` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `cod_per` char(6) NOT NULL DEFAULT '',
  `nombre_per` char(50) NOT NULL DEFAULT '',
  `valor_per` decimal(7,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `COD_PER` (`cod_per`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxclu
CREATE TABLE IF NOT EXISTS `mxclu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `nombre` char(60) NOT NULL DEFAULT '',
  `cargo` char(30) NOT NULL DEFAULT '',
  `celular` char(40) NOT NULL DEFAULT '',
  `email` char(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_CLI` (`cod_cli`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcm2
CREATE TABLE IF NOT EXISTS `mxcm2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `hora_ped` char(16) NOT NULL DEFAULT '',
  `duracion` int(5) NOT NULL DEFAULT 0,
  `numero` int(6) NOT NULL DEFAULT 0,
  `origen` char(2) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `mozo` int(4) NOT NULL DEFAULT 0,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `cantidad` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cubiertos` decimal(12,2) NOT NULL DEFAULT 0.00,
  `idfint` decimal(10,0) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `NUMERO` (`numero`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_ART` (`cod_art`),
  KEY `FECTUR` (`fecha`,`turno`),
  KEY `REG` (`fecha`,`turno`,`cod_ctv`,`mesa`,`cod_art`),
  KEY `FECTURNUM` (`fecha`,`turno`,`numero`)
) ENGINE=InnoDB AUTO_INCREMENT=73075 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcmo
CREATE TABLE IF NOT EXISTS `mxcmo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(40) NOT NULL DEFAULT '',
  `tipo` char(2) NOT NULL DEFAULT '',
  `destino` char(100) NOT NULL DEFAULT '',
  `cod_dest` int(2) NOT NULL DEFAULT 0,
  `nivel` int(1) NOT NULL DEFAULT 0,
  `cargadir` bit(1) NOT NULL DEFAULT b'0',
  `no_subr` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `COD_DEST` (`cod_dest`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcobrel
CREATE TABLE IF NOT EXISTS `mxcobrel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_sql` int(11) NOT NULL DEFAULT 0,
  `idtiempo` bigint(13) NOT NULL DEFAULT 0,
  `idequipo` char(70) NOT NULL DEFAULT '',
  `fechacreacion` date NOT NULL DEFAULT '0000-00-00',
  `cod_ctv` char(1) NOT NULL DEFAULT '',
  `mesa` char(4) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxconf
CREATE TABLE IF NOT EXISTS `mxconf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_prd` char(10) NOT NULL DEFAULT '',
  `tag` char(30) NOT NULL DEFAULT '',
  `valor` char(100) NOT NULL DEFAULT '',
  `cod_ter` int(9) NOT NULL DEFAULT 0,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CON_PRDTAG` (`cod_prd`,`tag`,`cod_usu`,`cod_ter`),
  KEY `COD_PRD` (`cod_prd`),
  KEY `TAG` (`tag`),
  KEY `COD_USU` (`cod_usu`)
) ENGINE=InnoDB AUTO_INCREMENT=3841660 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcpb
CREATE TABLE IF NOT EXISTS `mxcpb` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(2) NOT NULL DEFAULT '',
  `nombre` char(40) NOT NULL DEFAULT '',
  `y` decimal(6,1) NOT NULL DEFAULT 0.0,
  `x` decimal(6,1) NOT NULL DEFAULT 0.0,
  `valor` char(200) NOT NULL DEFAULT '',
  `largo` int(2) NOT NULL DEFAULT 0,
  `decimales` int(1) NOT NULL DEFAULT 0,
  `font` char(80) NOT NULL DEFAULT '',
  `color` int(8) NOT NULL DEFAULT 0,
  `pidenc` bit(1) NOT NULL DEFAULT b'0',
  `pve` int(4) NOT NULL DEFAULT 0,
  `mail` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `Y` (`y`),
  KEY `X` (`x`),
  KEY `VALOR` (`valor`),
  KEY `CODY` (`codigo`,`y`,`x`)
) ENGINE=InnoDB AUTO_INCREMENT=1823 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxcpf
CREATE TABLE IF NOT EXISTS `mxcpf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(4) NOT NULL DEFAULT '',
  `nombre` char(50) NOT NULL DEFAULT '',
  `usapunit` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxctc
CREATE TABLE IF NOT EXISTS `mxctc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cod_for` char(2) NOT NULL DEFAULT '',
  `numtarj` decimal(16,0) NOT NULL DEFAULT 0,
  `cupon` decimal(10,0) NOT NULL DEFAULT 0,
  `lote` int(4) NOT NULL DEFAULT 0,
  `cuotas` int(3) NOT NULL DEFAULT 0,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `pago` char(2) NOT NULL DEFAULT '',
  `referencia` char(36) NOT NULL DEFAULT '',
  `recibo` int(8) NOT NULL DEFAULT 0,
  `cobrador` int(4) NOT NULL DEFAULT 0,
  `idfint` decimal(10,0) NOT NULL DEFAULT 0,
  `desde` char(2) NOT NULL DEFAULT '',
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `id_ant` int(11) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  `orden` decimal(3,0) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_FOR` (`cod_for`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `RECIBO` (`recibo`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `NUMERO3` (`numero3`),
  KEY `ENVIO` (`envio`),
  KEY `ORDEN` (`orden`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`),
  KEY `CLIREG` (`cod_cli`,`cod_cpb`,`prefijo`,`numero`),
  KEY `REG2` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`),
  KEY `CLIREGCOB` (`cod_cli`,`cod_cpb`,`prefijo`,`numero`,`recibo`),
  KEY `REG3` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`),
  KEY `CLIREG3` (`cod_cli`,`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`)
) ENGINE=InnoDB AUTO_INCREMENT=17805 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxctg
CREATE TABLE IF NOT EXISTS `mxctg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(40) NOT NULL DEFAULT '',
  `dep_ing` char(2) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxctr
CREATE TABLE IF NOT EXISTS `mxctr` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `hora` char(10) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `cubiertos` int(3) NOT NULL DEFAULT 0,
  `total` decimal(16,2) NOT NULL DEFAULT 0.00,
  `referencia` char(40) NOT NULL DEFAULT '',
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `idfint` decimal(10,0) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_USU` (`cod_usu`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`)
) ENGINE=InnoDB AUTO_INCREMENT=15098 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxctv
CREATE TABLE IF NOT EXISTS `mxctv` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(2) NOT NULL DEFAULT '',
  `nombre` char(30) NOT NULL DEFAULT '',
  `tipo` char(2) NOT NULL DEFAULT '',
  `plano` bit(1) NOT NULL DEFAULT b'0',
  `act_grilla` bit(1) NOT NULL DEFAULT b'0',
  `tam_grilla` int(4) NOT NULL DEFAULT 0,
  `listaturno1` char(14) NOT NULL DEFAULT '',
  `listaturno2` char(14) NOT NULL DEFAULT '',
  `listaturno3` char(14) NOT NULL DEFAULT '',
  `cob_pri` bit(1) NOT NULL DEFAULT b'0',
  `cob_dir` bit(1) NOT NULL DEFAULT b'0',
  `vtacte` bit(1) NOT NULL DEFAULT b'0',
  `comandas` bit(1) NOT NULL DEFAULT b'0',
  `bloq_salir` bit(1) NOT NULL DEFAULT b'0',
  `bloq_ctrl` bit(1) NOT NULL DEFAULT b'0',
  `vista` char(2) NOT NULL DEFAULT '',
  `cod_cat` char(140) NOT NULL DEFAULT '',
  `rep_oblig` bit(1) NOT NULL DEFAULT b'0',
  `auto_prop` bit(1) NOT NULL DEFAULT b'0',
  `cod_prop` int(5) NOT NULL DEFAULT 0,
  `desc_prop` int(3) NOT NULL DEFAULT 0,
  `preg_prop` bit(1) NOT NULL DEFAULT b'0',
  `carga_aut` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `TIPO` (`tipo`),
  KEY `COD_CAT` (`cod_cat`),
  KEY `COD_PROP` (`cod_prop`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxctvfuc
CREATE TABLE IF NOT EXISTS `mxctvfuc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `cod_rua` int(3) NOT NULL DEFAULT 0,
  `tipo` int(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_RUA` (`cod_rua`),
  KEY `TIPO` (`tipo`),
  KEY `BUSQUEDA` (`cod_ctv`,`cod_rua`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxdato
CREATE TABLE IF NOT EXISTS `mxdato` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_terminal` decimal(10,0) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `hora` char(10) NOT NULL DEFAULT '',
  `dato1` char(200) NOT NULL DEFAULT '',
  `dato2` char(200) NOT NULL DEFAULT '',
  `dato3` char(200) NOT NULL DEFAULT '',
  `dato4` char(200) NOT NULL DEFAULT '',
  `dato5` char(200) NOT NULL DEFAULT '',
  `dato6` char(200) NOT NULL DEFAULT '',
  `dato7` char(200) NOT NULL DEFAULT '',
  `dato8` char(200) NOT NULL DEFAULT '',
  `dato9` char(200) NOT NULL DEFAULT '',
  `dato10` char(250) NOT NULL DEFAULT '',
  `dato11` mediumtext NOT NULL DEFAULT '',
  `dato12` char(200) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_TERMINAL` (`cod_terminal`),
  KEY `FECHA` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxdep
CREATE TABLE IF NOT EXISTS `mxdep` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(2) NOT NULL DEFAULT '',
  `nombre` char(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxdif
CREATE TABLE IF NOT EXISTS `mxdif` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `impresora` char(10) NOT NULL DEFAULT '',
  `tipo` char(4) NOT NULL DEFAULT '',
  `puerto` int(1) NOT NULL DEFAULT 0,
  `baudios` int(6) NOT NULL DEFAULT 0,
  `cpi` char(4) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `copias` char(2) NOT NULL DEFAULT '',
  `disman` bit(1) NOT NULL DEFAULT b'0',
  `arcnf` char(40) NOT NULL DEFAULT '',
  `noborra` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `IMPRESORA` (`impresora`),
  KEY `TIPO` (`tipo`),
  KEY `PREFIJO` (`prefijo`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MESA` (`mesa`),
  KEY `COD_USU` (`cod_usu`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxdis
CREATE TABLE IF NOT EXISTS `mxdis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(3) NOT NULL DEFAULT 0,
  `nombre` char(100) NOT NULL DEFAULT '',
  `tipo` char(22) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxdisdet
CREATE TABLE IF NOT EXISTS `mxdisdet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom_obj` char(70) NOT NULL DEFAULT '',
  `val_top` int(4) NOT NULL DEFAULT 0,
  `val_left` int(4) NOT NULL DEFAULT 0,
  `val_height` int(4) NOT NULL DEFAULT 0,
  `val_width` int(4) NOT NULL DEFAULT 0,
  `val_visible` bit(1) NOT NULL DEFAULT b'0',
  `val_columnw` char(80) NOT NULL DEFAULT '',
  `cod_dis` int(3) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `NOM_OBJ` (`nom_obj`),
  KEY `COD_DIS` (`cod_dis`),
  KEY `DISOBJ` (`cod_dis`,`nom_obj`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxdoc
CREATE TABLE IF NOT EXISTS `mxdoc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_pais` int(3) NOT NULL DEFAULT 0,
  `tipo` char(5) NOT NULL DEFAULT '',
  `mascara` char(30) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `ID` (`id`),
  KEY `COD_PAIS` (`cod_pais`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxdpar
CREATE TABLE IF NOT EXISTS `mxdpar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(3) NOT NULL DEFAULT 0,
  `nombre` char(20) NOT NULL DEFAULT '',
  `detalle` char(70) NOT NULL DEFAULT '',
  `foto` mediumtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxdparctv
CREATE TABLE IF NOT EXISTS `mxdparctv` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_par` int(3) NOT NULL DEFAULT 0,
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `delivery` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxdpu
CREATE TABLE IF NOT EXISTS `mxdpu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_dis` int(3) NOT NULL DEFAULT 0,
  `cod_emp` int(5) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_DIS` (`cod_dis`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `DOSCOD` (`cod_emp`,`cod_dis`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxdsn
CREATE TABLE IF NOT EXISTS `mxdsn` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `driver` char(100) NOT NULL DEFAULT '',
  `nombre` char(60) NOT NULL DEFAULT '',
  `host` char(200) NOT NULL DEFAULT '',
  `db` char(60) NOT NULL DEFAULT '',
  `port` int(5) NOT NULL DEFAULT 0,
  `user` char(40) NOT NULL DEFAULT '',
  `pwd` char(40) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxdto
CREATE TABLE IF NOT EXISTS `mxdto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(30) NOT NULL DEFAULT '',
  `tipo` char(2) NOT NULL DEFAULT '',
  `valor` decimal(16,2) NOT NULL DEFAULT 0.00,
  `deliact` bit(1) NOT NULL DEFAULT b'0',
  `discont` bit(1) NOT NULL DEFAULT b'0',
  `nivel` int(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxelec
CREATE TABLE IF NOT EXISTS `mxelec` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pago` int(4) NOT NULL,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `hora` char(5) NOT NULL,
  `cod_for` char(1) NOT NULL,
  `cod_gw` int(4) NOT NULL,
  `cod_ter` int(4) NOT NULL,
  `cod_ctv` char(2) NOT NULL,
  `mesa` char(4) NOT NULL,
  `orden` int(3) NOT NULL,
  `turno` char(2) NOT NULL,
  `cod_cpb` char(2) NOT NULL,
  `prefijo` int(4) NOT NULL,
  `numero` int(8) NOT NULL,
  `cod_loc` int(4) NOT NULL,
  `numero3` int(12) NOT NULL,
  `tipo_oper` char(25) NOT NULL,
  `pago_ref` char(50) NOT NULL,
  `intento` int(4) NOT NULL,
  `importe` decimal(14,2) NOT NULL,
  `estado` char(20) NOT NULL,
  `estadogw` char(20) NOT NULL,
  `orderdata` mediumtext NOT NULL,
  `cod_suc` int(5) NOT NULL,
  `idfint` int(10) NOT NULL,
  `envio` int(6) NOT NULL,
  `payment_id` char(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ID_PAGO` (`id_pago`),
  KEY `COD_FOR` (`cod_for`),
  KEY `COD_GW` (`cod_gw`),
  KEY `COD_TER` (`cod_ter`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MESA` (`mesa`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxeml
CREATE TABLE IF NOT EXISTS `mxeml` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(5) NOT NULL DEFAULT 0,
  `nombre` char(100) NOT NULL DEFAULT '',
  `alias` char(60) NOT NULL DEFAULT '',
  `server` char(200) NOT NULL DEFAULT '',
  `puerto` char(20) NOT NULL DEFAULT '',
  `autent` bit(1) NOT NULL DEFAULT b'0',
  `ssl` bit(1) NOT NULL DEFAULT b'0',
  `usuario` char(100) NOT NULL DEFAULT '',
  `pass` char(100) NOT NULL DEFAULT '',
  `tipo` char(2) NOT NULL DEFAULT '',
  `usaapimx` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxemp
CREATE TABLE IF NOT EXISTS `mxemp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(4) NOT NULL DEFAULT 0,
  `nombre` char(80) NOT NULL DEFAULT '',
  `apellido` char(80) NOT NULL DEFAULT '',
  `direccion` char(102) NOT NULL DEFAULT '',
  `telefono` char(40) NOT NULL DEFAULT '',
  `telcelular` char(24) NOT NULL DEFAULT '',
  `tipo_doc` char(2) NOT NULL DEFAULT '',
  `nro_doc` char(26) NOT NULL DEFAULT '',
  `tipo` char(6) NOT NULL DEFAULT '',
  `adicpda` bit(1) NOT NULL DEFAULT b'0',
  `nombreusu` char(20) NOT NULL DEFAULT '',
  `clave` char(30) NOT NULL DEFAULT '',
  `dig_id` mediumtext NOT NULL DEFAULT '',
  `nivel` int(1) NOT NULL DEFAULT 0,
  `foto` char(255) NOT NULL DEFAULT '',
  `e_mail` char(80) NOT NULL DEFAULT '',
  `fecha_nac` date NOT NULL DEFAULT '0000-00-00',
  `anotacion` char(80) NOT NULL DEFAULT '',
  `fecha_ing` date NOT NULL DEFAULT '0000-00-00',
  `rinde` bit(1) NOT NULL DEFAULT b'0',
  `tipo_comi` char(2) NOT NULL DEFAULT '',
  `valor_comi` decimal(16,2) NOT NULL DEFAULT 0.00,
  `yarindio` bit(1) NOT NULL DEFAULT b'0',
  `sueldo` decimal(16,2) NOT NULL DEFAULT 0.00,
  `max_adel` decimal(16,2) NOT NULL DEFAULT 0.00,
  `max_vale` decimal(16,2) NOT NULL DEFAULT 0.00,
  `aguinaldo` decimal(16,2) NOT NULL DEFAULT 0.00,
  `nro_recibo` int(8) NOT NULL DEFAULT 0,
  `ultperliq` date NOT NULL DEFAULT '0000-00-00',
  `fecultliq` date NOT NULL DEFAULT '0000-00-00',
  `vto_libsan` date NOT NULL DEFAULT '0000-00-00',
  `fecha_baja` date NOT NULL DEFAULT '0000-00-00',
  `activaweb` bit(1) NOT NULL DEFAULT b'0',
  `p1` char(40) NOT NULL DEFAULT '',
  `p2` char(40) NOT NULL DEFAULT '',
  `p3` char(40) NOT NULL DEFAULT '',
  `p4` char(40) NOT NULL DEFAULT '',
  `p5` char(40) NOT NULL DEFAULT '',
  `p6` char(40) NOT NULL DEFAULT '',
  `p7` char(40) NOT NULL DEFAULT '',
  `p8` char(40) NOT NULL DEFAULT '',
  `p9` char(40) NOT NULL DEFAULT '',
  `p10` char(40) NOT NULL DEFAULT '',
  `p11` char(40) NOT NULL DEFAULT '',
  `p12` char(40) NOT NULL DEFAULT '',
  `p90` char(40) NOT NULL DEFAULT '',
  `p91` char(40) NOT NULL DEFAULT '',
  `p92` char(40) NOT NULL DEFAULT '',
  `p93` char(40) NOT NULL DEFAULT '',
  `p94` char(40) NOT NULL DEFAULT '',
  `p95` char(40) NOT NULL DEFAULT '',
  `p96` char(40) NOT NULL DEFAULT '',
  `p97` char(40) NOT NULL DEFAULT '',
  `p99` char(40) NOT NULL DEFAULT '',
  `clave_acc` char(140) NOT NULL DEFAULT '',
  `contrato` char(2) NOT NULL DEFAULT '',
  `admines` bit(1) NOT NULL DEFAULT b'0',
  `lab1` char(40) NOT NULL DEFAULT '',
  `lab2` char(40) NOT NULL DEFAULT '',
  `lab3` char(40) NOT NULL DEFAULT '',
  `lab4` char(40) NOT NULL DEFAULT '',
  `lab5` char(40) NOT NULL DEFAULT '',
  `lab6` char(40) NOT NULL DEFAULT '',
  `lab7` char(40) NOT NULL DEFAULT '',
  `horfec` date NOT NULL DEFAULT '0000-00-00',
  `hora` char(10) NOT NULL DEFAULT '',
  `hordem` int(3) NOT NULL DEFAULT 0,
  `hortip` char(2) NOT NULL DEFAULT '',
  `horobs` char(50) NOT NULL DEFAULT '',
  `bloqueado` bit(1) NOT NULL DEFAULT b'0',
  `cod_sec` char(6) NOT NULL DEFAULT '',
  `observac` mediumtext NOT NULL DEFAULT '',
  `inc_age` bit(1) NOT NULL DEFAULT b'0',
  `emailpred` int(5) NOT NULL DEFAULT 0,
  `cajapred` char(6) NOT NULL DEFAULT '',
  `fotoblob` blob NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `APELLIDO` (`apellido`),
  KEY `COD_SEC` (`cod_sec`),
  KEY `CAJAPRED` (`cajapred`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxeop
CREATE TABLE IF NOT EXISTS `mxeop` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `op_suc` int(8) NOT NULL DEFAULT 0,
  `op_adm` int(8) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `CODIGO` (`cod_suc`,`op_suc`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxesp
CREATE TABLE IF NOT EXISTS `mxesp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `cod_esp` int(3) NOT NULL DEFAULT 0,
  `nom_esp` char(255) NOT NULL DEFAULT '',
  `nom_web` char(255) NOT NULL DEFAULT '',
  `subido` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `COD_ART` (`cod_art`),
  KEY `COD_ESP` (`cod_esp`),
  KEY `CODIGO` (`cod_art`,`cod_esp`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxeva
CREATE TABLE IF NOT EXISTS `mxeva` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` decimal(10,0) NOT NULL DEFAULT 0,
  `cod_eve` int(8) NOT NULL DEFAULT 0,
  `tipo` char(6) NOT NULL DEFAULT '',
  `hor_antel` int(3) NOT NULL DEFAULT 0,
  `dias_antel` int(4) NOT NULL DEFAULT 0,
  `horas_dura` int(3) NOT NULL DEFAULT 0,
  `dias_dura` int(4) NOT NULL DEFAULT 0,
  `titulo` char(60) NOT NULL DEFAULT '',
  `detalle` mediumtext NOT NULL DEFAULT '',
  `hecho` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `COD_EVE` (`cod_eve`),
  KEY `DIAHORANT` (`dias_antel`,`hor_antel`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxevc
CREATE TABLE IF NOT EXISTS `mxevc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(4) NOT NULL DEFAULT 0,
  `nombre` char(80) NOT NULL DEFAULT '',
  `mesa` char(14) NOT NULL DEFAULT '',
  `observac` char(60) NOT NULL DEFAULT '',
  `cod_eve` int(8) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `COD_EVE` (`cod_eve`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxeve
CREATE TABLE IF NOT EXISTS `mxeve` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(8) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `fecharea` date NOT NULL DEFAULT '0000-00-00',
  `hora` char(10) NOT NULL DEFAULT '',
  `horafin` char(10) NOT NULL DEFAULT '',
  `presuasig` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tipo` char(6) NOT NULL DEFAULT '',
  `estado` char(2) NOT NULL DEFAULT '',
  `empresp` int(3) NOT NULL DEFAULT 0,
  `vendedor` int(3) NOT NULL DEFAULT 0,
  `detalle` char(100) NOT NULL DEFAULT '',
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `cubmay` int(5) NOT NULL DEFAULT 0,
  `cubmayf` int(5) NOT NULL DEFAULT 0,
  `cubmen` int(5) NOT NULL DEFAULT 0,
  `cublib` int(5) NOT NULL DEFAULT 0,
  `cublibf` int(5) NOT NULL DEFAULT 0,
  `cubbrind` int(5) NOT NULL DEFAULT 0,
  `cubbrindf` int(5) NOT NULL DEFAULT 0,
  `listainvi` mediumtext NOT NULL DEFAULT '',
  `referente` char(60) NOT NULL DEFAULT '',
  `garantia` decimal(16,2) NOT NULL DEFAULT 0.00,
  `observac` mediumtext NOT NULL DEFAULT '',
  `costo` decimal(16,2) NOT NULL DEFAULT 0.00,
  `total` decimal(16,2) NOT NULL DEFAULT 0.00,
  `salon` char(6) NOT NULL DEFAULT '',
  `tipomesa` char(6) NOT NULL DEFAULT '',
  `mesas` int(4) NOT NULL DEFAULT 0,
  `fact_asoc` char(26) NOT NULL DEFAULT '',
  `archivos` mediumtext NOT NULL DEFAULT '',
  `evebloq` bit(1) NOT NULL DEFAULT b'0',
  `opcional` mediumtext NOT NULL DEFAULT '',
  `obvsadi` mediumtext NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `FECHA` (`fecha`),
  KEY `FECHAREA` (`fecharea`),
  KEY `COD_CLI` (`cod_cli`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxeverem
CREATE TABLE IF NOT EXISTS `mxeverem` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_eve` int(8) NOT NULL DEFAULT 0,
  `cod_rem` int(8) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_EVE` (`cod_eve`),
  KEY `COD_REM` (`cod_rem`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxevi
CREATE TABLE IF NOT EXISTS `mxevi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_eve` int(8) NOT NULL DEFAULT 0,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `cod_ins` int(5) NOT NULL DEFAULT 0,
  `cantidad` decimal(9,2) NOT NULL DEFAULT 0.00,
  `observac` mediumtext NOT NULL DEFAULT '',
  `venta` decimal(16,2) NOT NULL DEFAULT 0.00,
  `costo` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cost_tot` decimal(16,2) NOT NULL DEFAULT 0.00,
  `descorch` bit(1) NOT NULL DEFAULT b'0',
  `porcventa` decimal(6,2) NOT NULL DEFAULT 0.00,
  `descargado` decimal(6,2) NOT NULL DEFAULT 0.00,
  `varios` char(70) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_EVE` (`cod_eve`),
  KEY `COD_ART` (`cod_art`),
  KEY `COD_INS` (`cod_ins`),
  KEY `CANTIDAD` (`cantidad`),
  KEY `ART_EVE` (`cod_eve`,`cod_art`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxevl
CREATE TABLE IF NOT EXISTS `mxevl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_eve` int(8) NOT NULL DEFAULT 0,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `nombre` char(100) NOT NULL DEFAULT '',
  `precio` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cantidad` decimal(11,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `COD_EVE` (`cod_eve`),
  KEY `COD_ART` (`cod_art`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxevp
CREATE TABLE IF NOT EXISTS `mxevp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `logo` char(8) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxevs
CREATE TABLE IF NOT EXISTS `mxevs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(3) NOT NULL DEFAULT 0,
  `nombre` char(60) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxexc
CREATE TABLE IF NOT EXISTS `mxexc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `tipo_art` char(2) NOT NULL DEFAULT '',
  `cod_dto` int(2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_ART` (`cod_art`),
  KEY `COD_DTO` (`cod_dto`),
  KEY `ARTDTO` (`cod_art`,`cod_dto`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxfac
CREATE TABLE IF NOT EXISTS `mxfac` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `fecha_ent` date NOT NULL DEFAULT '0000-00-00',
  `hora_ent` char(10) NOT NULL DEFAULT '',
  `hora_sal` char(10) NOT NULL DEFAULT '',
  `hora_rep` char(10) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `fecha_fis` date NOT NULL DEFAULT '0000-00-00',
  `hora_fis` char(12) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `cod_call` char(8) NOT NULL DEFAULT '',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `cubiertos` int(3) NOT NULL DEFAULT 0,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `nom_cli` char(100) NOT NULL DEFAULT '',
  `raz_cli` char(70) NOT NULL DEFAULT '',
  `localidad` char(30) NOT NULL DEFAULT '',
  `provincia` char(30) NOT NULL DEFAULT '',
  `tipo_iva` char(2) NOT NULL DEFAULT '',
  `cuit` char(26) NOT NULL DEFAULT '',
  `cod_rep` int(4) NOT NULL DEFAULT 0,
  `cod_dto` int(2) NOT NULL DEFAULT 0,
  `imp_dto` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `total` decimal(16,2) NOT NULL DEFAULT 0.00,
  `neto1` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tasa1` decimal(7,2) NOT NULL DEFAULT 0.00,
  `iva1` decimal(16,2) NOT NULL DEFAULT 0.00,
  `neto2` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tasa2` decimal(7,2) NOT NULL DEFAULT 0.00,
  `iva2` decimal(16,2) NOT NULL DEFAULT 0.00,
  `neto3` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tasa3` decimal(7,2) NOT NULL DEFAULT 0.00,
  `iva3` decimal(16,2) NOT NULL DEFAULT 0.00,
  `imp_int` decimal(16,2) NOT NULL DEFAULT 0.00,
  `trans` char(26) NOT NULL DEFAULT '',
  `puntos` int(7) NOT NULL DEFAULT 0,
  `var1` char(20) NOT NULL DEFAULT '',
  `var2` char(20) NOT NULL DEFAULT '',
  `var3` char(20) NOT NULL DEFAULT '',
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `id_pape` int(11) NOT NULL DEFAULT 0,
  `cae` char(60) NOT NULL DEFAULT '',
  `idfint` decimal(10,0) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `FECHA_FIS` (`fecha_fis`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_CALL` (`cod_call`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `COD_REP` (`cod_rep`),
  KEY `COD_DTO` (`cod_dto`),
  KEY `COD_USU` (`cod_usu`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `NUMERO3` (`numero3`),
  KEY `IDFINT` (`idfint`),
  KEY `ENVIO` (`envio`),
  KEY `ID_PAPE` (`id_pape`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`),
  KEY `REG2` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`),
  KEY `CPBPTOSUC` (`cod_cpb`,`prefijo`,`cod_suc`),
  KEY `REG3` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`),
  KEY `CLIREG3` (`cod_cli`,`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`)
) ENGINE=InnoDB AUTO_INCREMENT=17814 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxfach
CREATE TABLE IF NOT EXISTS `mxfach` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `cod_cpb` char(2) NOT NULL,
  `prefijo` int(4) NOT NULL,
  `numero` int(8) NOT NULL,
  `nrores` char(50) NOT NULL DEFAULT '',
  `idhuesp` char(50) NOT NULL DEFAULT '',
  `nrohabit` char(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxfae
CREATE TABLE IF NOT EXISTS `mxfae` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cod_ret1` int(3) NOT NULL DEFAULT 0,
  `imp_ret1` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_ret2` int(3) NOT NULL DEFAULT 0,
  `imp_ret2` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_ret3` int(3) NOT NULL DEFAULT 0,
  `imp_ret3` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cai_cae` decimal(14,0) NOT NULL DEFAULT 0,
  `fec_vto` date NOT NULL DEFAULT '0000-00-00',
  PRIMARY KEY (`id`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_RET1` (`cod_ret1`),
  KEY `COD_RET2` (`cod_ret2`),
  KEY `COD_RET3` (`cod_ret3`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxfer
CREATE TABLE IF NOT EXISTS `mxfer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(3) NOT NULL DEFAULT 0,
  `nombre` char(60) NOT NULL DEFAULT '',
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `tipo` char(2) NOT NULL DEFAULT '',
  `mueve` char(2) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `FECHA` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxfid
CREATE TABLE IF NOT EXISTS `mxfid` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(100) NOT NULL DEFAULT '',
  `tipo` char(2) NOT NULL DEFAULT '',
  `desfec` date NOT NULL DEFAULT '0000-00-00',
  `hasfec` date NOT NULL DEFAULT '0000-00-00',
  `descli` int(7) NOT NULL DEFAULT 0,
  `hascli` int(7) NOT NULL DEFAULT 0,
  `modo` char(2) NOT NULL DEFAULT '',
  `premio` char(200) NOT NULL DEFAULT '',
  `detalle` mediumtext NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxfiscal
CREATE TABLE IF NOT EXISTS `mxfiscal` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` char(25) DEFAULT NULL,
  `puerto` char(20) NOT NULL,
  `baudios` int(10) NOT NULL,
  `cpi` int(10) NOT NULL,
  `ip` char(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxfor
CREATE TABLE IF NOT EXISTS `mxfor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(2) NOT NULL DEFAULT '',
  `nombre` char(30) NOT NULL DEFAULT '',
  `tipo` char(2) NOT NULL DEFAULT '',
  `dato_adic` bit(1) NOT NULL DEFAULT b'0',
  `suma_caj` bit(1) NOT NULL DEFAULT b'0',
  `rinde` bit(1) NOT NULL DEFAULT b'0',
  `logo` char(255) NOT NULL DEFAULT '',
  `cotizacion` decimal(17,3) NOT NULL DEFAULT 0.000,
  `cod_ban` int(2) NOT NULL DEFAULT 0,
  `dias_acred` int(2) NOT NULL DEFAULT 0,
  `descuento` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_pro` int(5) NOT NULL DEFAULT 0,
  `cod_cbac` int(2) NOT NULL DEFAULT 0,
  `cod_cbad` int(2) NOT NULL DEFAULT 0,
  `puntos` int(7) NOT NULL DEFAULT 0,
  `pesosxpto` int(5) NOT NULL DEFAULT 0,
  `nummasc` char(60) NOT NULL DEFAULT '',
  `logoblob` blob NOT NULL DEFAULT '',
  `deliact` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `TIPO` (`tipo`),
  KEY `COD_BAN` (`cod_ban`),
  KEY `COD_PRO` (`cod_pro`),
  KEY `COD_CBAC` (`cod_cbac`),
  KEY `COD_CBAD` (`cod_cbad`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxforgw
CREATE TABLE IF NOT EXISTS `mxforgw` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_gw` int(4) NOT NULL,
  `cod_for` char(2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `COD_GW` (`cod_gw`),
  KEY `COD_FOR` (`cod_for`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxforpos
CREATE TABLE IF NOT EXISTS `mxforpos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_for` char(1) NOT NULL DEFAULT '',
  `cod_pos` int(4) NOT NULL DEFAULT 0,
  `codigoente` char(10) NOT NULL DEFAULT '',
  `nro_comercio` char(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_FOR` (`cod_for`),
  KEY `COD_POS` (`cod_pos`),
  KEY `CODIGOENTE` (`codigoente`),
  KEY `NRO_COMERCIO` (`nro_comercio`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxgas
CREATE TABLE IF NOT EXISTS `mxgas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_pro` int(5) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `numero1` int(4) NOT NULL DEFAULT 0,
  `numero2` int(8) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `fecha_ing` date NOT NULL DEFAULT '0000-00-00',
  `fecha_iva` date NOT NULL DEFAULT '0000-00-00',
  `total` decimal(17,3) NOT NULL DEFAULT 0.000,
  `neto` decimal(17,3) NOT NULL DEFAULT 0.000,
  `netoexento` decimal(17,3) NOT NULL DEFAULT 0.000,
  `tasa1` decimal(16,2) NOT NULL DEFAULT 0.00,
  `iva1` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tasa2` decimal(16,2) NOT NULL DEFAULT 0.00,
  `iva2` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tasa3` decimal(16,2) NOT NULL DEFAULT 0.00,
  `iva3` decimal(16,2) NOT NULL DEFAULT 0.00,
  `codper1` char(6) NOT NULL DEFAULT '',
  `percep1` decimal(16,2) NOT NULL DEFAULT 0.00,
  `codper2` char(6) NOT NULL DEFAULT '',
  `percep2` decimal(16,2) NOT NULL DEFAULT 0.00,
  `codper3` char(6) NOT NULL DEFAULT '',
  `percep3` decimal(16,2) NOT NULL DEFAULT 0.00,
  `imp_int` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_cga` int(3) NOT NULL DEFAULT 0,
  `cod_ctg` int(2) NOT NULL DEFAULT 0,
  `observac` char(80) NOT NULL DEFAULT '',
  `fisc_id` char(50) NOT NULL DEFAULT '',
  `id_comprob` char(50) NOT NULL DEFAULT '',
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_PRO` (`cod_pro`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `NUMERO1` (`numero1`),
  KEY `NUMERO2` (`numero2`),
  KEY `FECHA` (`fecha`),
  KEY `FECHA_ING` (`fecha_ing`),
  KEY `FECHA_IVA` (`fecha_iva`),
  KEY `COD_CGA` (`cod_cga`),
  KEY `COD_CTG` (`cod_ctg`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`cod_pro`,`cod_cpb`,`numero1`,`numero2`),
  KEY `REG2` (`cod_pro`,`cod_cpb`,`numero1`,`numero2`,`cod_suc`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxgeo
CREATE TABLE IF NOT EXISTS `mxgeo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sucursal` char(200) NOT NULL DEFAULT '',
  `campo` char(200) NOT NULL DEFAULT '',
  `valor` mediumtext NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxgra
CREATE TABLE IF NOT EXISTS `mxgra` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(30) NOT NULL DEFAULT '',
  `color` decimal(10,0) NOT NULL DEFAULT 0,
  `foto` char(255) NOT NULL DEFAULT '',
  `fuente` char(100) NOT NULL DEFAULT '',
  `fotoblob` blob NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxgrs
CREATE TABLE IF NOT EXISTS `mxgrs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(5) NOT NULL DEFAULT 0,
  `nombre` char(60) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxhor
CREATE TABLE IF NOT EXISTS `mxhor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `entrada` char(10) NOT NULL DEFAULT '',
  `demora` int(3) NOT NULL DEFAULT 0,
  `salida` char(10) NOT NULL DEFAULT '',
  `fechasal` date NOT NULL DEFAULT '0000-00-00',
  `tipo` char(2) NOT NULL DEFAULT '',
  `obs` char(60) NOT NULL DEFAULT '',
  `duracion` char(10) NOT NULL DEFAULT '',
  `fecha2` date NOT NULL DEFAULT '0000-00-00',
  `entrada2` char(10) NOT NULL DEFAULT '',
  `demora2` int(3) NOT NULL DEFAULT 0,
  `salida2` char(10) NOT NULL DEFAULT '',
  `fechasal2` date NOT NULL DEFAULT '0000-00-00',
  `tipo2` char(2) NOT NULL DEFAULT '',
  `obs2` char(60) NOT NULL DEFAULT '',
  `duracion2` char(10) NOT NULL DEFAULT '',
  `labhist` char(90) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `FECHA` (`fecha`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `ENVIO` (`envio`),
  KEY `EMPFEC` (`cod_emp`,`fecha`),
  KEY `EMPFECSUC` (`cod_emp`,`fecha`,`cod_suc`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mximpres
CREATE TABLE IF NOT EXISTS `mximpres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(8) NOT NULL,
  `cod_ter` int(9) NOT NULL,
  `nombre_imp` char(50) DEFAULT '',
  `estado` char(50) DEFAULT '',
  `fecha` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `puerto` char(50) DEFAULT '',
  `driver` char(50) DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  UNIQUE KEY `IMP_TERMINAL` (`cod_ter`,`nombre_imp`),
  KEY `COD_TER` (`cod_ter`),
  KEY `NOMBRE_IMP` (`nombre_imp`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxins
CREATE TABLE IF NOT EXISTS `mxins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(5) NOT NULL DEFAULT 0,
  `codid` char(30) NOT NULL DEFAULT '',
  `nombre` char(100) NOT NULL DEFAULT '',
  `cod_rui` int(3) NOT NULL DEFAULT 0,
  `unidad_med` char(10) NOT NULL DEFAULT '',
  `precio` decimal(17,3) NOT NULL DEFAULT 0.000,
  `precio_pro` decimal(17,3) NOT NULL DEFAULT 0.000,
  `stock_min` decimal(17,3) NOT NULL DEFAULT 0.000,
  `stock_max` decimal(17,3) NOT NULL DEFAULT 0.000,
  `dep_carga` char(2) NOT NULL DEFAULT '',
  `envase1` char(10) NOT NULL DEFAULT '',
  `neto1` decimal(17,3) NOT NULL DEFAULT 0.000,
  `precio1` decimal(17,3) NOT NULL DEFAULT 0.000,
  `envase2` char(10) NOT NULL DEFAULT '',
  `neto2` decimal(17,3) NOT NULL DEFAULT 0.000,
  `precio2` decimal(17,3) NOT NULL DEFAULT 0.000,
  `envase3` char(10) NOT NULL DEFAULT '',
  `neto3` decimal(17,3) NOT NULL DEFAULT 0.000,
  `precio3` decimal(17,3) NOT NULL DEFAULT 0.000,
  `porciones` decimal(11,3) NOT NULL DEFAULT 0.000,
  `modo_desc` char(2) NOT NULL DEFAULT '',
  `cod_iva` char(2) NOT NULL DEFAULT '',
  `imp_int` decimal(16,2) NOT NULL DEFAULT 0.00,
  `receta` mediumtext NOT NULL DEFAULT '',
  `foto` char(255) NOT NULL DEFAULT '',
  `desperdicio` decimal(7,2) NOT NULL DEFAULT 0.00,
  `ensegui` bit(1) NOT NULL DEFAULT b'0',
  `discont` bit(1) NOT NULL DEFAULT b'0',
  `topecomp` decimal(16,3) NOT NULL DEFAULT 0.000,
  `eveventa` decimal(14,2) NOT NULL DEFAULT 0.00,
  `imp_int_porc` bit(1) NOT NULL DEFAULT b'0',
  `fotoblob` blob NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `COD_RUI` (`cod_rui`),
  KEY `DEP_CARGA` (`dep_carga`),
  KEY `COD_IVA` (`cod_iva`),
  KEY `LIST` (`cod_rui`,`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxinspre
CREATE TABLE IF NOT EXISTS `mxinspre` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ins` int(5) NOT NULL,
  `fecha` date NOT NULL,
  `precio` decimal(14,0) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_INS` (`cod_ins`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxinv
CREATE TABLE IF NOT EXISTS `mxinv` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `cod_dep` char(2) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `hora` char(10) NOT NULL DEFAULT '',
  `cod_ins` int(5) NOT NULL DEFAULT 0,
  `precio` decimal(17,3) NOT NULL DEFAULT 0.000,
  `stock` decimal(13,3) NOT NULL DEFAULT 0.000,
  `cantidad` decimal(13,3) NOT NULL DEFAULT 0.000,
  `cantconteo` int(2) NOT NULL DEFAULT 0,
  `mvs_rem` int(8) NOT NULL DEFAULT 0,
  `envio` int(8) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_DEP` (`cod_dep`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_INS` (`cod_ins`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`fecha`,`turno`,`cod_ins`,`cod_dep`),
  KEY `REGSUC` (`fecha`,`turno`,`cod_ins`,`cod_dep`,`cod_suc`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxipa
CREATE TABLE IF NOT EXISTS `mxipa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ctv` char(1) NOT NULL,
  `mesa` char(4) NOT NULL,
  `cod_cpb` char(1) NOT NULL,
  `prefijo` int(4) NOT NULL,
  `numero` int(8) NOT NULL,
  `cod_for` char(1) NOT NULL,
  `importe` decimal(16,2) NOT NULL,
  `cuotas` int(3) NOT NULL,
  `cupon` int(10) NOT NULL,
  `lote` int(4) NOT NULL,
  `numtarj` int(16) NOT NULL,
  `cod_loc` int(4) NOT NULL,
  `fecha` date NOT NULL,
  `hora` char(5) NOT NULL,
  `aplicada` bit(1) NOT NULL,
  `propina` decimal(16,2) NOT NULL,
  `idsql` int(11) NOT NULL,
  `idfint` int(10) NOT NULL,
  `envio` int(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ENVIO` (`envio`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MESA` (`mesa`),
  KEY `IDFINT` (`idfint`),
  KEY `IDSQL` (`idsql`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxipp
CREATE TABLE IF NOT EXISTS `mxipp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_pro` int(5) NOT NULL DEFAULT 0,
  `cod_ins` int(5) NOT NULL DEFAULT 0,
  `precio` decimal(17,3) NOT NULL DEFAULT 0.000,
  PRIMARY KEY (`id`),
  KEY `COD_PRO` (`cod_pro`),
  KEY `COD_INS` (`cod_ins`),
  KEY `INSPRO` (`cod_ins`,`cod_pro`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxitc
CREATE TABLE IF NOT EXISTS `mxitc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_pro` int(5) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `numero1` int(4) NOT NULL DEFAULT 0,
  `numero2` int(8) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `cantidad` decimal(12,3) NOT NULL DEFAULT 0.000,
  `neto` decimal(17,3) NOT NULL DEFAULT 0.000,
  `cod_ins` int(5) NOT NULL DEFAULT 0,
  `precio` decimal(17,3) NOT NULL DEFAULT 0.000,
  `preciotot` decimal(17,3) NOT NULL DEFAULT 0.000,
  `tasa` decimal(8,2) NOT NULL DEFAULT 0.00,
  `iva` decimal(16,2) NOT NULL DEFAULT 0.00,
  `ivatot` decimal(16,2) NOT NULL DEFAULT 0.00,
  `imp_int` decimal(16,2) NOT NULL DEFAULT 0.00,
  `imp_inttot` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_cga` int(3) NOT NULL DEFAULT 0,
  `referencia` char(26) NOT NULL DEFAULT '',
  `envio` int(6) NOT NULL DEFAULT 0,
  `orden` decimal(3,0) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_PRO` (`cod_pro`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `NUMERO1` (`numero1`),
  KEY `NUMERO2` (`numero2`),
  KEY `FECHA` (`fecha`),
  KEY `COD_INS` (`cod_ins`),
  KEY `COD_CGA` (`cod_cga`),
  KEY `ENVIO` (`envio`),
  KEY `ORDEN` (`orden`),
  KEY `REG` (`cod_pro`,`cod_cpb`,`numero1`,`numero2`),
  KEY `REG2` (`cod_pro`,`cod_cpb`,`numero1`,`numero2`,`cod_suc`),
  KEY `INSFEC` (`cod_ins`,`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxite
CREATE TABLE IF NOT EXISTS `mxite` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `cantidad` decimal(11,3) NOT NULL DEFAULT 0.000,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `precio` decimal(16,2) NOT NULL DEFAULT 0.00,
  `remito` bit(1) NOT NULL DEFAULT b'0',
  `padre` int(2) NOT NULL DEFAULT 0,
  `hijo` int(2) NOT NULL DEFAULT 0,
  `tipo_rel` char(2) NOT NULL DEFAULT '',
  `puntos` int(6) NOT NULL DEFAULT 0,
  `idfint` decimal(10,0) NOT NULL DEFAULT 0,
  `cod_dto` int(2) NOT NULL DEFAULT 0,
  `imp_dto` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  `turno` char(2) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `FECHA` (`fecha`),
  KEY `COD_ART` (`cod_art`),
  KEY `PADRE` (`padre`),
  KEY `HIJO` (`hijo`),
  KEY `COD_DTO` (`cod_dto`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `NUMERO3` (`numero3`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`),
  KEY `REG2` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`),
  KEY `REG3` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`)
) ENGINE=InnoDB AUTO_INCREMENT=59144 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxkds
CREATE TABLE IF NOT EXISTS `mxkds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(3) NOT NULL DEFAULT 0,
  `nombre` char(60) NOT NULL DEFAULT '',
  `host` char(60) NOT NULL DEFAULT '',
  `port` int(5) NOT NULL DEFAULT 0,
  `usu` char(20) NOT NULL DEFAULT '',
  `pass` char(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxlog
CREATE TABLE IF NOT EXISTS `mxlog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `pc` char(30) NOT NULL DEFAULT '',
  `hora_ini` char(10) NOT NULL DEFAULT '',
  `hora_fin` char(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `COD_EMP` (`cod_emp`)
) ENGINE=InnoDB AUTO_INCREMENT=200 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxlogdel
CREATE TABLE IF NOT EXISTS `mxlogdel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `envio` int(6) NOT NULL,
  `tabla` char(20) NOT NULL,
  `tipo` char(1) NOT NULL,
  `pk` char(100) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `ENVIO` (`envio`),
  KEY `TABLA` (`tabla`),
  KEY `FECHA` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxlogver
CREATE TABLE IF NOT EXISTS `mxlogver` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ver` int(9) NOT NULL,
  `cod_ter` int(9) NOT NULL,
  `detalle` mediumtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `COD_VER` (`cod_ver`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxloyalty
CREATE TABLE IF NOT EXISTS `mxloyalty` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(5) NOT NULL,
  `partner` char(50) NOT NULL DEFAULT '',
  `activa` bit(1) DEFAULT NULL,
  `tipo` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGOTAG` (`codigo`),
  KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxloyaltyd
CREATE TABLE IF NOT EXISTS `mxloyaltyd` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_partner` int(5) NOT NULL,
  `cod_art` int(11) NOT NULL,
  `cod_dto` char(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxloyaltyf
CREATE TABLE IF NOT EXISTS `mxloyaltyf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cpb` char(6) NOT NULL,
  `prefijo` int(11) NOT NULL,
  `numero` int(11) NOT NULL,
  `cod_partner` int(5) NOT NULL,
  `cod_art` char(50) NOT NULL,
  `monto_dto` decimal(11,0) NOT NULL,
  `cod_ctv` char(10) NOT NULL,
  `mesa` char(10) NOT NULL,
  `codecupon` char(50) NOT NULL,
  `dni` char(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmed
CREATE TABLE IF NOT EXISTS `mxmed` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` char(240) NOT NULL DEFAULT '',
  `funcion` char(255) NOT NULL DEFAULT '',
  `nombre` char(200) NOT NULL DEFAULT '',
  `parametros` char(40) NOT NULL DEFAULT '',
  `orden` int(3) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ORDEN` (`orden`),
  KEY `NOMBRE` (`nombre`,`orden`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmen
CREATE TABLE IF NOT EXISTS `mxmen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipsis` char(6) NOT NULL DEFAULT '',
  `nropopup` int(2) NOT NULL DEFAULT 0,
  `popup` char(10) NOT NULL DEFAULT '',
  `nrobar` int(2) NOT NULL DEFAULT 0,
  `acceso` int(2) NOT NULL DEFAULT 0,
  `bar` char(40) NOT NULL DEFAULT '',
  `tipo` char(1) NOT NULL DEFAULT '',
  `accion` char(40) NOT NULL DEFAULT '',
  `parametro` char(10) NOT NULL DEFAULT '',
  `helpid` int(5) NOT NULL DEFAULT 0,
  `helpfile` char(20) NOT NULL DEFAULT '',
  `icono` char(65) NOT NULL DEFAULT '',
  `iconodes` char(65) NOT NULL DEFAULT '',
  `codigo` int(4) NOT NULL DEFAULT 0,
  `archivos` char(20) NOT NULL DEFAULT '',
  `menu_ver` int(1) NOT NULL DEFAULT 0,
  `detalle` char(40) NOT NULL DEFAULT '',
  `oldmen` char(80) NOT NULL DEFAULT '',
  `menufav` char(21) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `nropopup` (`nropopup`),
  KEY `popup` (`popup`),
  KEY `codigo` (`codigo`),
  KEY `menu_ver` (`menu_ver`),
  KEY `POPBAR` (`nropopup`,`nrobar`)
) ENGINE=InnoDB AUTO_INCREMENT=419 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmenemp
CREATE TABLE IF NOT EXISTS `mxmenemp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cat` char(6) DEFAULT NULL,
  `cod_emp` int(4) DEFAULT NULL,
  `cod_menu` int(4) NOT NULL DEFAULT 0,
  `activo` char(60) NOT NULL DEFAULT '',
  `creado` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `cod_cat` (`cod_cat`),
  KEY `cod_emp` (`cod_emp`),
  KEY `cod_menu` (`cod_menu`)
) ENGINE=InnoDB AUTO_INCREMENT=3119 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmenfav
CREATE TABLE IF NOT EXISTS `mxmenfav` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_menu` int(4) NOT NULL,
  `cod_emp` int(4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `COD_MENU` (`cod_menu`),
  KEY `COD_EMP` (`cod_emp`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmensaje
CREATE TABLE IF NOT EXISTS `mxmensaje` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(11) NOT NULL,
  `mensaje` mediumtext NOT NULL,
  `fecha` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `FECHA` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=27873 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmensis
CREATE TABLE IF NOT EXISTS `mxmensis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipsis` int(3) NOT NULL DEFAULT 0,
  `cod_men` int(3) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `tipsis` (`tipsis`),
  KEY `cod_men` (`cod_men`)
) ENGINE=InnoDB AUTO_INCREMENT=863 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmes
CREATE TABLE IF NOT EXISTS `mxmes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesa` char(8) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mozo` int(4) NOT NULL DEFAULT 0,
  `y` int(4) NOT NULL DEFAULT 0,
  `x` int(4) NOT NULL DEFAULT 0,
  `ancho` int(3) NOT NULL DEFAULT 0,
  `alto` int(3) NOT NULL DEFAULT 0,
  `curvatura` int(3) NOT NULL DEFAULT 0,
  `plano` char(2) NOT NULL DEFAULT '',
  `unificada` char(10) NOT NULL DEFAULT '',
  `mesaeve` char(6) NOT NULL DEFAULT '',
  `planoeve` char(6) NOT NULL DEFAULT '',
  `principal` bit(1) NOT NULL DEFAULT b'0',
  `parcial` bit(1) NOT NULL DEFAULT b'0',
  `parlib` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `MESA` (`mesa`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MOZO` (`mozo`),
  KEY `PLANO` (`plano`),
  KEY `PARCIAL` (`parcial`),
  KEY `PARLIB` (`parlib`),
  KEY `CTVMES` (`cod_ctv`,`mesa`)
) ENGINE=InnoDB AUTO_INCREMENT=423 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmlg
CREATE TABLE IF NOT EXISTS `mxmlg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(5) NOT NULL DEFAULT 0,
  `nombre` char(70) NOT NULL DEFAULT '',
  `remitente` char(80) NOT NULL DEFAULT '',
  `asunto` char(140) NOT NULL DEFAULT '',
  `cuerpo` mediumtext NOT NULL DEFAULT '',
  `ruta` char(255) NOT NULL DEFAULT '',
  `fecha_env` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `nom_remi` char(70) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmlglst
CREATE TABLE IF NOT EXISTS `mxmlglst` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(4) NOT NULL DEFAULT 0,
  `nombre` char(70) NOT NULL DEFAULT '',
  `formula` mediumtext NOT NULL DEFAULT '',
  `mailing` char(70) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmon
CREATE TABLE IF NOT EXISTS `mxmon` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(5) NOT NULL DEFAULT 0,
  `nombre` char(60) NOT NULL DEFAULT '',
  `valor` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_for` char(2) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `COD_FOR` (`cod_for`),
  KEY `FORCOD` (`cod_for`,`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmov
CREATE TABLE IF NOT EXISTS `mxmov` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `cod_ban` int(2) NOT NULL DEFAULT 0,
  `cod_cba` int(2) NOT NULL DEFAULT 0,
  `numero` decimal(10,0) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `detalle` char(100) NOT NULL DEFAULT '',
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tipo` char(2) NOT NULL DEFAULT '',
  `referencia` char(36) NOT NULL DEFAULT '',
  `fecha_cob` date NOT NULL DEFAULT '0000-00-00',
  `cobrado` bit(1) NOT NULL DEFAULT b'0',
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `COD_BAN` (`cod_ban`),
  KEY `COD_CBA` (`cod_cba`),
  KEY `NUMERO` (`numero`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `REFERENCIA` (`referencia`),
  KEY `FECHA_COB` (`fecha_cob`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`cod_ban`,`cod_cba`,`numero`),
  KEY `REG2` (`cod_ban`,`cod_cba`,`numero`,`cod_suc`),
  KEY `REFSUC` (`referencia`,`cod_suc`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmovdet
CREATE TABLE IF NOT EXISTS `mxmovdet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cpb` char(1) NOT NULL DEFAULT '',
  `prefijo` decimal(4,0) NOT NULL DEFAULT 0,
  `numero` decimal(8,0) NOT NULL DEFAULT 0,
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `cod_suc` decimal(5,0) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(1) NOT NULL DEFAULT '',
  `importe` decimal(14,2) NOT NULL DEFAULT 0.00,
  `envio` int(4) NOT NULL DEFAULT 0,
  `id_ctc` int(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `NUMERO3` (`numero3`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmvs
CREATE TABLE IF NOT EXISTS `mxmvs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `cod_cmo` int(2) NOT NULL DEFAULT 0,
  `inventario` bit(1) NOT NULL DEFAULT b'0',
  `remito` int(8) NOT NULL DEFAULT 0,
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `cod_dep` char(2) NOT NULL DEFAULT '',
  `artins` char(2) NOT NULL DEFAULT '',
  `codigo` int(5) NOT NULL DEFAULT 0,
  `cantidad` decimal(11,3) NOT NULL DEFAULT 0.000,
  `precio` decimal(17,3) NOT NULL DEFAULT 0.000,
  `facturado` bit(1) NOT NULL DEFAULT b'0',
  `idfint` decimal(10,0) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  `orden` decimal(3,0) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `PREFIJO` (`prefijo`),
  KEY `COD_CMO` (`cod_cmo`),
  KEY `REMITO` (`remito`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `COD_DEP` (`cod_dep`),
  KEY `CODIGO` (`codigo`),
  KEY `ENVIO` (`envio`),
  KEY `ORDEN` (`orden`),
  KEY `REG` (`fecha`,`turno`,`remito`,`artins`),
  KEY `REMCOD` (`remito`,`codigo`,`artins`,`precio`),
  KEY `REMSUC` (`remito`,`cod_suc`),
  KEY `REG2` (`fecha`,`turno`,`remito`,`artins`,`cod_suc`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmvsan
CREATE TABLE IF NOT EXISTS `mxmvsan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `fecha_anu` date NOT NULL DEFAULT '0000-00-00',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `remito` int(8) NOT NULL DEFAULT 0,
  `artins` char(2) NOT NULL DEFAULT '',
  `inventario` bit(1) NOT NULL DEFAULT b'0',
  `cod_cmo` int(2) NOT NULL DEFAULT 0,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `cod_dep` char(2) NOT NULL DEFAULT '',
  `aplicado` bit(1) NOT NULL DEFAULT b'0',
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `PREFIJO` (`prefijo`),
  KEY `COD_CMO` (`cod_cmo`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_DEP` (`cod_dep`),
  KEY `ENVIO` (`envio`),
  KEY `REG3` (`remito`,`cod_suc`,`artins`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxmvsobs
CREATE TABLE IF NOT EXISTS `mxmvsobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `remito` int(8) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `observac` char(255) NOT NULL DEFAULT '',
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `REMITO` (`remito`),
  KEY `COD_SUC` (`cod_suc`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxnotif
CREATE TABLE IF NOT EXISTS `mxnotif` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_mens` int(11) NOT NULL,
  `cod_tipn` char(10) NOT NULL,
  `cod_ter` int(9) NOT NULL,
  `leido` bit(1) DEFAULT b'0',
  `bajado` bit(1) DEFAULT b'0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `MSG_TERMINAL` (`cod_ter`,`cod_mens`),
  KEY `COD_MENS` (`cod_mens`),
  KEY `COD_TIPN` (`cod_tipn`),
  KEY `COD_TER` (`cod_ter`)
) ENGINE=InnoDB AUTO_INCREMENT=83617 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxnotilog
CREATE TABLE IF NOT EXISTS `mxnotilog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_noti` int(4) NOT NULL DEFAULT 0,
  `cod_app` int(5) NOT NULL DEFAULT 0,
  `respuesta` char(6) NOT NULL DEFAULT '',
  `fecha_creacion` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `COD_NOTI` (`cod_noti`),
  KEY `COD_APP` (`cod_app`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxnotpurg
CREATE TABLE IF NOT EXISTS `mxnotpurg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxnotter
CREATE TABLE IF NOT EXISTS `mxnotter` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_tipn` char(10) NOT NULL,
  `cod_ter` int(9) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `COD_TIPN` (`cod_tipn`),
  KEY `COD_TER` (`cod_ter`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxnum
CREATE TABLE IF NOT EXISTS `mxnum` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `detalle` char(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxord
CREATE TABLE IF NOT EXISTS `mxord` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_pro` int(5) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `fecha_rec` date NOT NULL DEFAULT '0000-00-00',
  `cod_ins` int(5) NOT NULL DEFAULT 0,
  `neto` decimal(11,3) NOT NULL DEFAULT 0.000,
  `cantidad` decimal(16,3) NOT NULL DEFAULT 0.000,
  `cant_rec` decimal(16,3) NOT NULL DEFAULT 0.000,
  `precio` decimal(17,3) NOT NULL DEFAULT 0.000,
  `unidad_med` char(10) NOT NULL DEFAULT '',
  `observac` char(80) NOT NULL DEFAULT '',
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_PRO` (`cod_pro`),
  KEY `NUMERO` (`numero`),
  KEY `FECHA` (`fecha`),
  KEY `FECHA_REC` (`fecha_rec`),
  KEY `COD_INS` (`cod_ins`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `REG` (`cod_pro`,`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxori
CREATE TABLE IF NOT EXISTS `mxori` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `archivo` char(20) NOT NULL DEFAULT '',
  `origen` int(2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ARCHIVO` (`archivo`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpaa
CREATE TABLE IF NOT EXISTS `mxpaa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `turno` char(2) NOT NULL DEFAULT '',
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `msjdif` bit(1) NOT NULL DEFAULT b'0',
  `usuario` char(20) NOT NULL DEFAULT '',
  `hora` char(10) NOT NULL DEFAULT '',
  `lista_act` char(2) NOT NULL DEFAULT '',
  `hora_act` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `hora_fin` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `force_act` bit(1) NOT NULL DEFAULT b'0',
  `last_mod` char(16) NOT NULL DEFAULT '',
  `bloq_plano` bit(1) NOT NULL DEFAULT b'0',
  `last_gen` char(16) NOT NULL DEFAULT '',
  `cubisact` char(10) NOT NULL DEFAULT '',
  `cubisant` char(10) NOT NULL DEFAULT '',
  `cubistot` char(10) NOT NULL DEFAULT '',
  `saldocaja` decimal(16,2) NOT NULL DEFAULT 0.00,
  `dias_predcli` int(4) NOT NULL DEFAULT 0,
  `nodet_esp` bit(1) NOT NULL DEFAULT b'0',
  `ultactadm` char(10) NOT NULL DEFAULT '',
  `fint` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `TURNO` (`turno`),
  KEY `FECHA` (`fecha`),
  KEY `USUARIO` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpadi
CREATE TABLE IF NOT EXISTS `mxpadi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_ape` int(11) NOT NULL DEFAULT 0,
  `cod_suc` char(5) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `mesa_mrest` char(8) NOT NULL DEFAULT '',
  `cantidad` decimal(11,3) NOT NULL DEFAULT 0.000,
  `cod_art` decimal(10,0) NOT NULL DEFAULT 0,
  `nombre` char(30) NOT NULL DEFAULT '',
  `precio` decimal(11,3) NOT NULL DEFAULT 0.000,
  `detalle` char(100) NOT NULL DEFAULT '',
  `hora` char(10) NOT NULL DEFAULT '',
  `orden` int(4) NOT NULL DEFAULT 0,
  `padre` int(4) NOT NULL DEFAULT 0,
  `hijo` int(4) NOT NULL DEFAULT 0,
  `tipo_rel` char(1) NOT NULL DEFAULT '',
  `procesado` bit(1) NOT NULL DEFAULT b'0',
  `fecha_new` date NOT NULL DEFAULT '0000-00-00',
  `fecha_update` date NOT NULL DEFAULT '0000-00-00',
  `marcha` bit(1) NOT NULL DEFAULT b'0',
  `codigo_externo` char(50) NOT NULL DEFAULT '',
  `idfint` int(10) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  `id_aux` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ID_APE` (`id_ape`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MESA` (`mesa`),
  KEY `MESA_MREST` (`mesa_mrest`),
  KEY `COD_ART` (`cod_art`),
  KEY `ID_AUX` (`id_aux`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpadped
CREATE TABLE IF NOT EXISTS `mxpadped` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ped` int(11) NOT NULL,
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `PEDIDO` (`cod_ped`),
  KEY `COD_PED` (`cod_ped`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MESA` (`mesa`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpae
CREATE TABLE IF NOT EXISTS `mxpae` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `protec` char(112) NOT NULL DEFAULT '',
  `mesavisi` bit(1) NOT NULL DEFAULT b'0',
  `codigo` int(8) NOT NULL DEFAULT 0,
  `fecha_act` date NOT NULL DEFAULT '0000-00-00',
  `rundoctor` bit(1) NOT NULL DEFAULT b'0',
  `empresa` char(60) NOT NULL DEFAULT '',
  `razon` char(60) NOT NULL DEFAULT '',
  `direccion` char(70) NOT NULL DEFAULT '',
  `localidad` char(30) NOT NULL DEFAULT '',
  `provincia` char(30) NOT NULL DEFAULT '',
  `cod_pais` int(2) NOT NULL DEFAULT 0,
  `cod_iva` char(2) NOT NULL DEFAULT '',
  `cuit` char(70) NOT NULL DEFAULT '',
  `sucursal` char(20) NOT NULL DEFAULT '',
  `imprelist` char(100) NOT NULL DEFAULT '',
  `mesamult` bit(1) NOT NULL DEFAULT b'0',
  `dir_resg` char(100) NOT NULL DEFAULT '',
  `turno1` char(20) NOT NULL DEFAULT '',
  `turno2` char(20) NOT NULL DEFAULT '',
  `turno3` char(20) NOT NULL DEFAULT '',
  `lista1` char(20) NOT NULL DEFAULT '',
  `lista2` char(20) NOT NULL DEFAULT '',
  `lista3` char(20) NOT NULL DEFAULT '',
  `lista4` char(20) NOT NULL DEFAULT '',
  `usa_stock` bit(1) NOT NULL DEFAULT b'0',
  `cant_plazas` int(4) NOT NULL DEFAULT 0,
  `bloq2maxi` bit(1) NOT NULL DEFAULT b'0',
  `varfac1` char(40) NOT NULL DEFAULT '',
  `varfac2` char(40) NOT NULL DEFAULT '',
  `varfac3` char(40) NOT NULL DEFAULT '',
  `txtfacparc` char(50) NOT NULL DEFAULT '',
  `modofparc` char(12) NOT NULL DEFAULT '',
  `iva_insc` decimal(7,2) NOT NULL DEFAULT 0.00,
  `iva_sobret` decimal(7,2) NOT NULL DEFAULT 0.00,
  `iva_dif1` decimal(7,2) NOT NULL DEFAULT 0.00,
  `iva_dif2` decimal(7,2) NOT NULL DEFAULT 0.00,
  `iva_dif3` decimal(7,2) NOT NULL DEFAULT 0.00,
  `maxfisacf` decimal(16,2) NOT NULL DEFAULT 0.00,
  `errorsql` bit(1) NOT NULL DEFAULT b'0',
  `lectortarj` bit(1) NOT NULL DEFAULT b'0',
  `lectorcom` int(2) NOT NULL DEFAULT 0,
  `utilizapunto` bit(1) NOT NULL DEFAULT b'0',
  `forres` char(2) NOT NULL DEFAULT '',
  `servweb` bit(1) NOT NULL DEFAULT b'0',
  `pidenc` bit(1) NOT NULL DEFAULT b'0',
  `dep_desc` char(2) NOT NULL DEFAULT '',
  `cod_cub` int(5) NOT NULL DEFAULT 0,
  `mascimpo` char(40) NOT NULL DEFAULT '',
  `screent` bit(1) NOT NULL DEFAULT b'0',
  `ventlispre` char(2) NOT NULL DEFAULT '',
  `masccant` char(16) NOT NULL DEFAULT '99',
  `ventcub` bit(1) NOT NULL DEFAULT b'0',
  `cant_neg` bit(1) NOT NULL DEFAULT b'0',
  `cliestad` bit(1) NOT NULL DEFAULT b'0',
  `modif_prec` bit(1) NOT NULL DEFAULT b'0',
  `redondeo` decimal(14,2) NOT NULL DEFAULT 0.00,
  `confi_cie` bit(1) NOT NULL DEFAULT b'0',
  `noprit0` bit(1) NOT NULL DEFAULT b'0',
  `vtamosini` bit(1) NOT NULL DEFAULT b'0',
  `noins_calle` bit(1) NOT NULL DEFAULT b'0',
  `paga_con` bit(1) NOT NULL DEFAULT b'0',
  `incartxcub` bit(1) NOT NULL DEFAULT b'0',
  `logemp` bit(1) NOT NULL DEFAULT b'0',
  `autologoff` int(3) NOT NULL DEFAULT 0,
  `salemesa` bit(1) NOT NULL DEFAULT b'0',
  `autosalmes` int(3) NOT NULL DEFAULT 0,
  `cob_mult` bit(1) NOT NULL DEFAULT b'0',
  `bot_ancho` int(3) NOT NULL DEFAULT 0,
  `bot_alto` int(3) NOT NULL DEFAULT 0,
  `bot_fuente` char(40) NOT NULL DEFAULT '',
  `gru_ancho` int(3) NOT NULL DEFAULT 0,
  `gru_alto` int(3) NOT NULL DEFAULT 0,
  `gru_fuente` char(40) NOT NULL DEFAULT '',
  `no_dupli` bit(1) NOT NULL DEFAULT b'0',
  `comenzal` bit(1) NOT NULL DEFAULT b'0',
  `comanda_avi` bit(1) NOT NULL DEFAULT b'0',
  `comanda_mar` bit(1) NOT NULL DEFAULT b'0',
  `comanda_anu` bit(1) NOT NULL DEFAULT b'0',
  `ordenrua` bit(1) NOT NULL DEFAULT b'0',
  `pedicontrol` bit(1) NOT NULL DEFAULT b'0',
  `pedpend` bit(1) NOT NULL DEFAULT b'0',
  `ped_normal` int(3) NOT NULL DEFAULT 0,
  `ped_demora` int(3) NOT NULL DEFAULT 0,
  `inactiva` int(3) NOT NULL DEFAULT 0,
  `selecrepar` char(2) NOT NULL DEFAULT '',
  `cpb_cierra1` char(2) NOT NULL DEFAULT '',
  `cpb_cierra2` char(2) NOT NULL DEFAULT '',
  `cpb_cierra3` char(2) NOT NULL DEFAULT '',
  `cpb_control` char(2) NOT NULL DEFAULT '',
  `cpb_mvs` char(2) NOT NULL DEFAULT '',
  `cpb_propina` char(2) NOT NULL DEFAULT '',
  `cpb_etcli` char(2) NOT NULL DEFAULT '',
  `cpb_ren` char(2) NOT NULL DEFAULT '',
  `topecaja` bit(1) NOT NULL DEFAULT b'0',
  `modotope` int(1) NOT NULL DEFAULT 0,
  `valortope` decimal(16,2) NOT NULL DEFAULT 0.00,
  `modo_remi` char(2) NOT NULL DEFAULT '',
  `cajonfis` bit(1) NOT NULL DEFAULT b'0',
  `nueva_esp` bit(1) NOT NULL DEFAULT b'0',
  `mesacerrada` int(3) NOT NULL DEFAULT 0,
  `llam_moz` int(3) NOT NULL DEFAULT 0,
  `imp_mvs` bit(1) NOT NULL DEFAULT b'0',
  `aud_artdel` bit(1) NOT NULL DEFAULT b'0',
  `aud_arttab` bit(1) NOT NULL DEFAULT b'0',
  `aud_artinv` bit(1) NOT NULL DEFAULT b'0',
  `aud_modpre` bit(1) NOT NULL DEFAULT b'0',
  `aud_camite` bit(1) NOT NULL DEFAULT b'0',
  `aud_mesdel` bit(1) NOT NULL DEFAULT b'0',
  `aud_mesmvs` bit(1) NOT NULL DEFAULT b'0',
  `aud_mestra` bit(1) NOT NULL DEFAULT b'0',
  `aud_adinum` bit(1) NOT NULL DEFAULT b'0',
  `aud_adicontrol` bit(1) NOT NULL DEFAULT b'0',
  `aud_mesvac` bit(1) NOT NULL DEFAULT b'0',
  `aud_mescon` bit(1) NOT NULL DEFAULT b'0',
  `aud_mesdto` bit(1) NOT NULL DEFAULT b'0',
  `aud_reifac` bit(1) NOT NULL DEFAULT b'0',
  `aud_anufac` bit(1) NOT NULL DEFAULT b'0',
  `aud_clides` bit(1) NOT NULL DEFAULT b'0',
  `aud_clicam` bit(1) NOT NULL DEFAULT b'0',
  `aud_especif` bit(1) NOT NULL DEFAULT b'0',
  `aud_elimesa` bit(1) NOT NULL DEFAULT b'0',
  `aud_ingvtaanu` bit(1) NOT NULL DEFAULT b'0',
  `aud_varias` bit(1) NOT NULL DEFAULT b'0',
  `aud_incmen` bit(1) NOT NULL DEFAULT b'0',
  `aud_dtomesa` bit(1) NOT NULL DEFAULT b'0',
  `aud_pidomot` bit(1) NOT NULL DEFAULT b'0',
  `aud_accclav` bit(1) NOT NULL DEFAULT b'0',
  `aud_listamot` bit(1) NOT NULL DEFAULT b'0',
  `ft_cpb` char(2) NOT NULL DEFAULT '',
  `ft_email` mediumtext NOT NULL DEFAULT '',
  `ft_saldo` char(2) NOT NULL DEFAULT '',
  `ft_recuento` char(2) NOT NULL DEFAULT '',
  `ft_bloqmab` bit(1) NOT NULL DEFAULT b'0',
  `ft_borasi` bit(1) NOT NULL DEFAULT b'0',
  `ft_borren` bit(1) NOT NULL DEFAULT b'0',
  `ft_rendpend` bit(1) NOT NULL DEFAULT b'0',
  `ft_bloqueo` bit(1) NOT NULL DEFAULT b'0',
  `ft_empreg` bit(1) NOT NULL DEFAULT b'0',
  `ft_filsuc` bit(1) NOT NULL DEFAULT b'0',
  `ft_cierres` char(2) NOT NULL DEFAULT '',
  `ft_zetas` char(2) NOT NULL DEFAULT '',
  `ft_expoxl` bit(1) NOT NULL DEFAULT b'0',
  `stocknega` bit(1) NOT NULL DEFAULT b'0',
  `modpreitc` char(2) NOT NULL DEFAULT '',
  `fec_ingcom` char(2) NOT NULL DEFAULT '',
  `cpb_op` char(2) NOT NULL DEFAULT '',
  `imprime_op` bit(1) NOT NULL DEFAULT b'0',
  `verfaccom` bit(1) NOT NULL DEFAULT b'0',
  `cpb_valeemp` char(2) NOT NULL DEFAULT '',
  `cpb_valegas` char(2) NOT NULL DEFAULT '',
  `cpb_rec` char(2) NOT NULL DEFAULT '',
  `cpb_cheque` char(2) NOT NULL DEFAULT '',
  `cpb_chedif` char(2) NOT NULL DEFAULT '',
  `imprime_oc` bit(1) NOT NULL DEFAULT b'0',
  `cpb_oc` char(2) NOT NULL DEFAULT '',
  `cpb_ingcaj` char(2) NOT NULL DEFAULT '',
  `impcompras` char(100) NOT NULL DEFAULT '',
  `base_compras` date NOT NULL DEFAULT '0000-00-00',
  `base_stock` date NOT NULL DEFAULT '0000-00-00',
  `base_iva` date NOT NULL DEFAULT '0000-00-00',
  `copiascomp` int(2) NOT NULL DEFAULT 0,
  `avisastock` bit(1) NOT NULL DEFAULT b'0',
  `avisfaltstk` bit(1) NOT NULL DEFAULT b'0',
  `obsc` bit(1) NOT NULL DEFAULT b'0',
  `fun_medida` char(2) NOT NULL DEFAULT '',
  `exporta` char(60) NOT NULL DEFAULT '',
  `importa` char(60) NOT NULL DEFAULT '',
  `tolerancia` int(2) NOT NULL DEFAULT 0,
  `durjormin` int(2) NOT NULL DEFAULT 0,
  `usa_huella` char(2) NOT NULL DEFAULT '',
  `sens_huella` int(1) NOT NULL DEFAULT 0,
  `cpb_entsal` char(2) NOT NULL DEFAULT '',
  `cpb_mvsalt` char(2) NOT NULL DEFAULT '',
  `cpb_reserva` char(2) NOT NULL DEFAULT '',
  `cpb_etiart` char(2) NOT NULL DEFAULT '',
  `tiempo_res` int(5) NOT NULL DEFAULT 0,
  `cli_campo1` char(20) NOT NULL DEFAULT '',
  `cli_campo2` char(20) NOT NULL DEFAULT '',
  `cli_campo3` char(20) NOT NULL DEFAULT '',
  `clicoddesde` int(7) NOT NULL DEFAULT 0,
  `clicodhasta` int(7) NOT NULL DEFAULT 0,
  `cliobs` bit(1) NOT NULL DEFAULT b'0',
  `pidecga` bit(1) NOT NULL DEFAULT b'0',
  `vis_rend` bit(1) NOT NULL DEFAULT b'0',
  `art_campo1` char(30) NOT NULL DEFAULT '',
  `art_campo2` char(30) NOT NULL DEFAULT '',
  `art_campo3` char(30) NOT NULL DEFAULT '',
  `art_campo4` char(30) NOT NULL DEFAULT '',
  `art_campo5` char(30) NOT NULL DEFAULT '',
  `act_proto` int(1) NOT NULL DEFAULT 0,
  `act_host` char(100) NOT NULL DEFAULT '',
  `act_usuario` char(30) NOT NULL DEFAULT '',
  `act_clave` char(30) NOT NULL DEFAULT '',
  `costo_estruc` decimal(17,3) NOT NULL DEFAULT 0.000,
  `aplfonimp` bit(1) NOT NULL DEFAULT b'0',
  `mascarapla` char(40) NOT NULL DEFAULT '',
  `ejercicio` int(3) NOT NULL DEFAULT 0,
  `desdeeje` date NOT NULL DEFAULT '0000-00-00',
  `hastaeje` date NOT NULL DEFAULT '0000-00-00',
  `canteje` int(3) NOT NULL DEFAULT 0,
  `costoestruc` decimal(17,3) NOT NULL DEFAULT 0.000,
  `cmapcal` int(5) NOT NULL DEFAULT 0,
  `cmapalt` int(5) NOT NULL DEFAULT 0,
  `eticanh` int(3) NOT NULL DEFAULT 0,
  `eticanv` int(3) NOT NULL DEFAULT 0,
  `etimargs` int(3) NOT NULL DEFAULT 0,
  `etimargse` int(3) NOT NULL DEFAULT 0,
  `etimargi` int(3) NOT NULL DEFAULT 0,
  `etimargie` int(3) NOT NULL DEFAULT 0,
  `etiancho` int(3) NOT NULL DEFAULT 0,
  `etialto` int(3) NOT NULL DEFAULT 0,
  `etiimp` char(60) NOT NULL DEFAULT '',
  `etitipoimp` char(60) NOT NULL DEFAULT '',
  `etifuente` char(40) NOT NULL DEFAULT '',
  `etidatos` mediumtext NOT NULL DEFAULT '',
  `etilargop` int(3) NOT NULL DEFAULT 0,
  `rg_moneda` char(20) NOT NULL DEFAULT '',
  `rg_simbolom` char(6) NOT NULL DEFAULT '',
  `rg_idtrib` char(10) NOT NULL DEFAULT '',
  `rg_msktrib` char(70) NOT NULL DEFAULT '',
  `contabilidad` bit(1) NOT NULL DEFAULT b'0',
  `evento` bit(1) NOT NULL DEFAULT b'0',
  `evedesc` int(4) NOT NULL DEFAULT 0,
  `evedesp` int(4) NOT NULL DEFAULT 0,
  `eveadic` int(4) NOT NULL DEFAULT 0,
  `ctamail` int(5) NOT NULL DEFAULT 0,
  `centraliz` char(2) NOT NULL DEFAULT '',
  `cbd` char(40) NOT NULL DEFAULT '',
  `tiempo_act` int(2) NOT NULL DEFAULT 0,
  `pantajus` bit(1) NOT NULL DEFAULT b'0',
  `wsafip_cert` char(255) NOT NULL DEFAULT '',
  `wsafip_key` char(255) NOT NULL DEFAULT '',
  `wsafip_wsaa` char(255) NOT NULL DEFAULT '',
  `wsafip_wsfe` char(255) NOT NULL DEFAULT '',
  `modo_geo` char(2) NOT NULL DEFAULT '',
  `geoloc` char(100) NOT NULL DEFAULT '',
  `fisc_nom` char(160) NOT NULL DEFAULT '',
  `fisc_masc` char(50) NOT NULL DEFAULT '',
  `protecc` mediumtext NOT NULL DEFAULT '',
  `cli_buspre` int(1) NOT NULL DEFAULT 0,
  `rg_nomtrib` char(50) NOT NULL DEFAULT '',
  `act_ayu` bit(1) NOT NULL DEFAULT b'0',
  `cpb_ret` char(2) NOT NULL DEFAULT '',
  `rg_cotizacion` decimal(17,2) NOT NULL DEFAULT 1.00,
  `rua_uy` char(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `COD_PAIS` (`cod_pais`),
  KEY `COD_IVA` (`cod_iva`),
  KEY `COD_CUB` (`cod_cub`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpag
CREATE TABLE IF NOT EXISTS `mxpag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_pro` int(5) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `numero1` int(4) NOT NULL DEFAULT 0,
  `numero2` int(8) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tipo` char(2) NOT NULL DEFAULT '',
  `referencia` char(38) NOT NULL DEFAULT '',
  `orden` int(8) NOT NULL DEFAULT 0,
  `fecha_ord` date NOT NULL DEFAULT '0000-00-00',
  `ordrel` int(8) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_PRO` (`cod_pro`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `NUMERO1` (`numero1`),
  KEY `NUMERO2` (`numero2`),
  KEY `FECHA` (`fecha`),
  KEY `TIPO` (`tipo`),
  KEY `REFERENCIA` (`referencia`),
  KEY `ORDEN` (`orden`),
  KEY `FECHA_ORD` (`fecha_ord`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`cod_pro`,`cod_cpb`,`numero1`,`numero2`),
  KEY `PROFEC` (`cod_pro`,`fecha`),
  KEY `PRONUMTIP` (`cod_pro`,`numero1`,`numero2`,`tipo`,`fecha`),
  KEY `REG2` (`cod_pro`,`cod_cpb`,`numero1`,`numero2`,`cod_suc`),
  KEY `ORDEN2` (`orden`,`cod_suc`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpaghue
CREATE TABLE IF NOT EXISTS `mxpaghue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cpb` char(2) NOT NULL,
  `prefijo` int(4) NOT NULL,
  `numero` int(8) NOT NULL,
  `nrores` char(50) NOT NULL DEFAULT '',
  `idhues` char(50) NOT NULL DEFAULT '',
  `fecha` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `marcatiempo` char(50) NOT NULL DEFAULT '',
  `nrohabit` char(50) NOT NULL DEFAULT '',
  `idpago` char(50) NOT NULL DEFAULT '',
  `estado` char(10) NOT NULL DEFAULT '',
  `monto` decimal(20,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpais
CREATE TABLE IF NOT EXISTS `mxpais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(50) NOT NULL DEFAULT '',
  `valor1` char(60) NOT NULL DEFAULT '',
  `valor2` char(60) NOT NULL DEFAULT '',
  `valor3` char(60) NOT NULL DEFAULT '',
  `valor4` char(60) NOT NULL DEFAULT '',
  `cod_arec` int(3) NOT NULL DEFAULT 0,
  `cod_alfa2` char(2) NOT NULL DEFAULT '',
  `cod_alfa3` char(3) NOT NULL DEFAULT '',
  `cod_num` char(3) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `COD_AREC` (`cod_arec`)
) ENGINE=InnoDB AUTO_INCREMENT=241 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpape
CREATE TABLE IF NOT EXISTS `mxpape` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_suc` char(5) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `mesa_mrest` char(8) NOT NULL DEFAULT '',
  `mozo` int(4) NOT NULL DEFAULT 0,
  `repartidor` int(4) NOT NULL DEFAULT 0,
  `hora` char(10) NOT NULL DEFAULT '',
  `cod_dto` int(2) NOT NULL DEFAULT 0,
  `tipo_dto` char(2) NOT NULL DEFAULT '',
  `valor_dto` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `nom_cli` char(200) NOT NULL DEFAULT '',
  `ape_cli` char(60) NOT NULL DEFAULT '',
  `mail_cli` char(60) NOT NULL DEFAULT '',
  `dni_cli` char(30) NOT NULL DEFAULT '',
  `tel_cli` char(40) NOT NULL DEFAULT '',
  `obs_cli` char(120) NOT NULL DEFAULT '',
  `observa` char(120) NOT NULL DEFAULT '',
  `procesado` bit(1) NOT NULL DEFAULT b'0',
  `fecha_new` date NOT NULL DEFAULT '0000-00-00',
  `fecha_update` date NOT NULL DEFAULT '0000-00-00',
  `pagado` bit(1) NOT NULL DEFAULT b'0',
  `ref_partner` char(20) NOT NULL DEFAULT '',
  `tienda` char(40) NOT NULL DEFAULT '',
  `id_partner` char(100) NOT NULL DEFAULT '',
  `codigo_externo` char(100) NOT NULL DEFAULT '',
  `calle` char(40) NOT NULL DEFAULT '',
  `numero` char(10) NOT NULL DEFAULT '',
  `piso` char(10) NOT NULL DEFAULT '',
  `cod_pos` char(10) NOT NULL DEFAULT '',
  `localidad` char(40) NOT NULL DEFAULT '',
  `estado` char(20) NOT NULL DEFAULT '',
  `condelivery` bit(1) NOT NULL DEFAULT b'0',
  `condeliveryext` bit(1) NOT NULL DEFAULT b'0',
  `motivorechazo` char(10) NOT NULL DEFAULT '',
  `codtiempodely` char(10) NOT NULL DEFAULT '',
  `fecharetiro` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `nuevocli` bit(1) NOT NULL DEFAULT b'0',
  `posdatado` bit(1) NOT NULL DEFAULT b'0',
  `pagacon` decimal(20,2) NOT NULL DEFAULT 0.00,
  `idtrans` char(50) NOT NULL DEFAULT '',
  `pickup` char(20) NOT NULL,
  `idfint` int(10) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  `id_aux` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PEDIDO` (`id_partner`,`codigo_externo`,`ref_partner`),
  KEY `ID` (`id`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MESA` (`mesa`),
  KEY `MESA_MREST` (`mesa_mrest`),
  KEY `MOZO` (`mozo`),
  KEY `REPARTIDOR` (`repartidor`),
  KEY `COD_DTO` (`cod_dto`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `NOM_CLI` (`nom_cli`),
  KEY `PROCESADO` (`procesado`),
  KEY `PAGADO` (`pagado`),
  KEY `REF_PARTNER` (`ref_partner`),
  KEY `COD_POS` (`cod_pos`),
  KEY `ID_AUX` (`id_aux`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpartner
CREATE TABLE IF NOT EXISTS `mxpartner` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(5) NOT NULL,
  `nombre` char(80) NOT NULL,
  `ms_codcli` int(7) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpaygw
CREATE TABLE IF NOT EXISTS `mxpaygw` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(4) NOT NULL,
  `nombre` char(30) NOT NULL,
  `url_login` char(100) NOT NULL,
  `url_pago` char(100) NOT NULL,
  `url_find` char(100) NOT NULL,
  `url_devol` char(100) NOT NULL,
  `usu` char(100) NOT NULL,
  `pass` char(50) NOT NULL,
  `interval` int(4) NOT NULL,
  `tipo_gw` char(2) NOT NULL DEFAULT 'MR',
  `gateway` char(20) NOT NULL DEFAULT '',
  `askmthd` char(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpdto
CREATE TABLE IF NOT EXISTS `mxpdto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_ape` int(4) NOT NULL DEFAULT 0,
  `tipo_dto` char(1) NOT NULL DEFAULT '',
  `valor_dto` decimal(14,2) NOT NULL DEFAULT 0.00,
  `monto_dto` decimal(14,2) NOT NULL DEFAULT 0.00,
  `nom_dto` char(15) NOT NULL DEFAULT '',
  `nota_dto` char(30) NOT NULL DEFAULT '',
  `prioridad` int(4) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  PRIMARY KEY (`id`),
  KEY `ID_APE` (`id_ape`),
  KEY `PRIORIDAD` (`prioridad`),
  KEY `FECHA` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxper
CREATE TABLE IF NOT EXISTS `mxper` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cod_per` char(6) NOT NULL DEFAULT '',
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_PER` (`cod_per`),
  KEY `NUMERO3` (`numero3`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`),
  KEY `REG3` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpla
CREATE TABLE IF NOT EXISTS `mxpla` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(40) NOT NULL DEFAULT '',
  `alias` int(5) NOT NULL DEFAULT 0,
  `tipo` int(1) NOT NULL DEFAULT 0,
  `nombre` char(90) NOT NULL DEFAULT '',
  `cta_tit` bit(1) NOT NULL DEFAULT b'0',
  `suma_en` char(40) NOT NULL DEFAULT '',
  `visibleenasoc` bit(1) NOT NULL DEFAULT b'0',
  `nivel` int(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `ALIAS` (`alias`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpos
CREATE TABLE IF NOT EXISTS `mxpos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_pos` int(4) NOT NULL DEFAULT 0,
  `nombre_pos` char(30) NOT NULL DEFAULT '',
  `cod_terminal` int(4) NOT NULL DEFAULT 0,
  `tipo_pos` char(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_POS` (`cod_pos`),
  KEY `NOMBRE_POS` (`nombre_pos`),
  KEY `COD_TERMINAL` (`cod_terminal`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxposconf
CREATE TABLE IF NOT EXISTS `mxposconf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_pos` int(4) NOT NULL DEFAULT 0,
  `conf` char(16) NOT NULL DEFAULT '',
  `tipo` char(3) NOT NULL DEFAULT '',
  `valor` char(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_POS` (`cod_pos`),
  KEY `CONF` (`conf`),
  KEY `TIPO` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxposdif
CREATE TABLE IF NOT EXISTS `mxposdif` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_pos` int(10) NOT NULL DEFAULT 0,
  `cod_terminal` int(4) NOT NULL DEFAULT 0,
  `cod_ctv` char(1) NOT NULL DEFAULT '',
  `mesa` char(4) NOT NULL DEFAULT '',
  `cod_cpb` char(1) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cod_for` char(1) NOT NULL DEFAULT '',
  `tipo_opercaion` char(25) NOT NULL DEFAULT '',
  `monto` decimal(14,2) NOT NULL DEFAULT 0.00,
  `cuotas` int(3) NOT NULL DEFAULT 0,
  `propina` decimal(10,2) NOT NULL DEFAULT 0.00,
  `autoriz` char(6) NOT NULL DEFAULT '',
  `cupon` char(7) NOT NULL DEFAULT '',
  `lote` char(3) NOT NULL DEFAULT '',
  `orden` int(3) NOT NULL DEFAULT 0,
  `estado` char(20) NOT NULL DEFAULT '',
  `ingreso` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `MESA` (`mesa`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `MONTO` (`monto`),
  KEY `COD_TERMINAL` (`cod_terminal`),
  KEY `COD_POS` (`cod_pos`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_FOR` (`cod_for`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxposgw
CREATE TABLE IF NOT EXISTS `mxposgw` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(11) NOT NULL,
  `cod_gw` int(4) NOT NULL,
  `nombre_ref` char(40) NOT NULL DEFAULT '',
  `id_pos` char(40) NOT NULL DEFAULT '',
  `cod_ter` int(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODPOS` (`codigo`,`id_pos`),
  KEY `CODIGO` (`codigo`),
  KEY `COD_GW` (`cod_gw`),
  KEY `ID_POS` (`id_pos`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxposlog
CREATE TABLE IF NOT EXISTS `mxposlog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_log` int(4) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(1) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cpb` char(1) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `order` int(3) NOT NULL DEFAULT 0,
  `cod_pos` int(4) NOT NULL DEFAULT 0,
  `cod_for` char(1) NOT NULL DEFAULT '',
  `cod_ente` char(10) NOT NULL DEFAULT '',
  `tipo_operacion` char(25) NOT NULL DEFAULT '',
  `monto` decimal(14,2) NOT NULL DEFAULT 0.00,
  `cuotas` int(3) NOT NULL DEFAULT 0,
  `estado` char(10) NOT NULL DEFAULT '',
  `autoriz` char(6) NOT NULL DEFAULT '',
  `cupon` char(7) NOT NULL DEFAULT '',
  `lote` char(3) NOT NULL DEFAULT '',
  `nom_cli_tc` char(20) NOT NULL DEFAULT '',
  `nro_tc` char(16) NOT NULL DEFAULT '',
  `fecha_trans` date NOT NULL DEFAULT '0000-00-00',
  `hora_trans` time NOT NULL DEFAULT '00:00:00',
  `mensaje` char(100) NOT NULL DEFAULT '',
  `id_log_ref` int(4) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ESTADO` (`estado`),
  KEY `TIPO_OPERACION` (`tipo_operacion`),
  KEY `ID_LOG` (`id_log`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_POS` (`cod_pos`),
  KEY `COD_FOR` (`cod_for`),
  KEY `COD_ENTE` (`cod_ente`),
  KEY `FECHA_TRANS` (`fecha_trans`),
  KEY `ID_LOG_REF` (`id_log_ref`),
  KEY `ENVIO` (`envio`),
  KEY `COD_USU` (`cod_usu`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxprd
CREATE TABLE IF NOT EXISTS `mxprd` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_prd` char(10) NOT NULL DEFAULT '',
  `nombre` char(255) NOT NULL DEFAULT '',
  `descripcio` mediumtext NOT NULL DEFAULT '',
  `imagen` char(255) NOT NULL DEFAULT '',
  `estado` bit(1) NOT NULL DEFAULT b'0',
  `fecha` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `orden` int(3) NOT NULL DEFAULT 0,
  `visible` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `COD_PRD` (`cod_prd`),
  KEY `FECHA` (`fecha`),
  KEY `ORDEN` (`orden`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxprm
CREATE TABLE IF NOT EXISTS `mxprm` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_prm` decimal(10,0) NOT NULL DEFAULT 0,
  `cod_rua` int(3) NOT NULL DEFAULT 0,
  `cod_item` decimal(10,0) NOT NULL DEFAULT 0,
  `cantidad` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tipo_item` char(2) NOT NULL DEFAULT '',
  `fecha_update` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `COD_PRM` (`cod_prm`),
  KEY `COD_RUA` (`cod_rua`),
  KEY `COD_ITEM` (`cod_item`),
  KEY `REG` (`cod_prm`,`cod_item`),
  KEY `REG2` (`cod_prm`,`cod_item`,`tipo_item`),
  KEY `PRMRUA` (`cod_prm`,`cod_rua`),
  KEY `PRMRUATIP` (`cod_prm`,`cod_rua`,`tipo_item`),
  KEY `FECHA_UPDATE` (`fecha_update`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxpro
CREATE TABLE IF NOT EXISTS `mxpro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(5) NOT NULL DEFAULT 0,
  `nombre` char(60) NOT NULL DEFAULT '',
  `razon` char(100) NOT NULL DEFAULT '',
  `direccion` char(60) NOT NULL DEFAULT '',
  `localidad` char(30) NOT NULL DEFAULT '',
  `contacto` char(60) NOT NULL DEFAULT '',
  `telefono` char(30) NOT NULL DEFAULT '',
  `fax` char(30) NOT NULL DEFAULT '',
  `celular` char(30) NOT NULL DEFAULT '',
  `tipo_iva` char(2) NOT NULL DEFAULT '',
  `cuit` char(70) NOT NULL DEFAULT '',
  `foto` char(255) NOT NULL DEFAULT '',
  `cbu` char(44) NOT NULL DEFAULT '',
  `aliascbu` char(20) NOT NULL DEFAULT '',
  `cod_cga` int(3) NOT NULL DEFAULT 0,
  `dias_venc` int(3) NOT NULL DEFAULT 0,
  `iva` bit(1) NOT NULL DEFAULT b'0',
  `iva_dif` bit(1) NOT NULL DEFAULT b'0',
  `e_mail` char(100) NOT NULL DEFAULT '',
  `observac` char(120) NOT NULL DEFAULT '',
  `fecultipp` date NOT NULL DEFAULT '0000-00-00',
  `detperc` mediumtext NOT NULL DEFAULT '',
  `fotoblob` blob NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `RAZON` (`razon`),
  KEY `CUIT` (`cuit`),
  KEY `COD_CGA` (`cod_cga`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrcj
CREATE TABLE IF NOT EXISTS `mxrcj` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `bil100` int(6) NOT NULL DEFAULT 0,
  `bil50` int(6) NOT NULL DEFAULT 0,
  `bil20` int(6) NOT NULL DEFAULT 0,
  `bil10` int(6) NOT NULL DEFAULT 0,
  `bil5` int(6) NOT NULL DEFAULT 0,
  `bil2` int(6) NOT NULL DEFAULT 0,
  `mon1` int(6) NOT NULL DEFAULT 0,
  `mon50` int(6) NOT NULL DEFAULT 0,
  `mon25` int(6) NOT NULL DEFAULT 0,
  `mon10` int(6) NOT NULL DEFAULT 0,
  `mon05` int(6) NOT NULL DEFAULT 0,
  `ticket` int(6) NOT NULL DEFAULT 0,
  `otras` int(6) NOT NULL DEFAULT 0,
  `for1` char(2) NOT NULL DEFAULT '',
  `can1` int(6) NOT NULL DEFAULT 0,
  `imp1` decimal(16,2) NOT NULL DEFAULT 0.00,
  `for2` char(2) NOT NULL DEFAULT '',
  `can2` int(6) NOT NULL DEFAULT 0,
  `imp2` decimal(16,2) NOT NULL DEFAULT 0.00,
  `for3` char(2) NOT NULL DEFAULT '',
  `can3` int(6) NOT NULL DEFAULT 0,
  `imp3` decimal(16,2) NOT NULL DEFAULT 0.00,
  `for4` char(2) NOT NULL DEFAULT '',
  `can4` int(6) NOT NULL DEFAULT 0,
  `imp4` decimal(16,2) NOT NULL DEFAULT 0.00,
  `for5` char(2) NOT NULL DEFAULT '',
  `can5` int(6) NOT NULL DEFAULT 0,
  `imp5` decimal(16,2) NOT NULL DEFAULT 0.00,
  `for6` char(2) NOT NULL DEFAULT '',
  `can6` int(6) NOT NULL DEFAULT 0,
  `imp6` decimal(16,2) NOT NULL DEFAULT 0.00,
  `for7` char(2) NOT NULL DEFAULT '',
  `can7` int(6) NOT NULL DEFAULT 0,
  `imp7` decimal(16,2) NOT NULL DEFAULT 0.00,
  `for8` char(2) NOT NULL DEFAULT '',
  `can8` int(6) NOT NULL DEFAULT 0,
  `imp8` decimal(16,2) NOT NULL DEFAULT 0.00,
  `for9` char(2) NOT NULL DEFAULT '',
  `can9` int(6) NOT NULL DEFAULT 0,
  `imp9` decimal(16,2) NOT NULL DEFAULT 0.00,
  `diferencia` decimal(16,2) NOT NULL DEFAULT 0.00,
  `compensa` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_usu` int(6) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `PREFIJO` (`prefijo`),
  KEY `COD_USU` (`cod_usu`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`fecha`,`turno`,`prefijo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrcjc
CREATE TABLE IF NOT EXISTS `mxrcjc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `prefijo` decimal(14,0) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `diferencia` decimal(16,2) NOT NULL DEFAULT 0.00,
  `compensa` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `PREFIJO` (`prefijo`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_USU` (`cod_usu`),
  KEY `REG` (`fecha`,`turno`,`prefijo`,`cod_suc`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrcjm
CREATE TABLE IF NOT EXISTS `mxrcjm` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `cod_for` char(2) NOT NULL DEFAULT '',
  `cod_mon` int(5) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cantidad` decimal(10,0) NOT NULL DEFAULT 0,
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `PREFIJO` (`prefijo`),
  KEY `COD_FOR` (`cod_for`),
  KEY `COD_MON` (`cod_mon`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_USU` (`cod_usu`),
  KEY `ENVIO` (`envio`),
  KEY `FORMON` (`cod_for`,`cod_mon`),
  KEY `REG` (`fecha`,`turno`,`prefijo`,`cod_suc`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrec
CREATE TABLE IF NOT EXISTS `mxrec` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_art` int(6) NOT NULL DEFAULT 0,
  `cod_ins` int(6) NOT NULL DEFAULT 0,
  `cantidad` decimal(11,3) NOT NULL DEFAULT 0.000,
  `observac` char(30) NOT NULL DEFAULT '',
  `bloq` bit(1) NOT NULL DEFAULT b'0',
  `cod_sec` int(3) NOT NULL DEFAULT 0,
  `fus_obl` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `COD_ART` (`cod_art`),
  KEY `COD_INS` (`cod_ins`),
  KEY `COD_SEC` (`cod_sec`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxreg
CREATE TABLE IF NOT EXISTS `mxreg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `hora` char(10) NOT NULL DEFAULT '',
  `usuario` char(20) NOT NULL DEFAULT '',
  `archivo` char(120) NOT NULL DEFAULT '',
  `referencia` char(100) NOT NULL DEFAULT '',
  `accion` char(20) NOT NULL DEFAULT '',
  `envio` int(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=426 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrelcpb
CREATE TABLE IF NOT EXISTS `mxrelcpb` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom_ter` char(50) DEFAULT NULL,
  `cod_cpb` char(1) NOT NULL,
  `cod_imp` int(1) NOT NULL,
  `id_tipimp` int(11) NOT NULL,
  `cant_copias` int(3) NOT NULL,
  `diferido` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `NOM_TER` (`nom_ter`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `COD_IMP` (`cod_imp`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxren
CREATE TABLE IF NOT EXISTS `mxren` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `cod_for` char(2) NOT NULL DEFAULT '',
  `valor` decimal(9,2) NOT NULL DEFAULT 0.00,
  `cantidad` int(4) NOT NULL DEFAULT 0,
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `venta` decimal(16,2) NOT NULL DEFAULT 0.00,
  `hora` char(18) NOT NULL DEFAULT '',
  `idfint` decimal(10,0) NOT NULL DEFAULT 0,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_FOR` (`cod_for`),
  KEY `COD_USU` (`cod_usu`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`cod_emp`,`fecha`,`turno`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrenest
CREATE TABLE IF NOT EXISTS `mxrenest` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_emp` int(11) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `hora` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `turno` char(2) NOT NULL DEFAULT '',
  `estado` int(1) NOT NULL DEFAULT 0,
  `cod_usu` int(11) NOT NULL DEFAULT 0,
  `id_ant` int(11) NOT NULL DEFAULT 0,
  `idfint` int(5) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrenmov
CREATE TABLE IF NOT EXISTS `mxrenmov` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_caj` int(11) NOT NULL DEFAULT 0,
  `id_ctc` int(11) NOT NULL DEFAULT 0,
  `id_ren` int(11) NOT NULL DEFAULT 0,
  `cod_for` char(2) NOT NULL DEFAULT '',
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `idfint` int(5) NOT NULL DEFAULT 0,
  `hora` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `tipo` int(5) NOT NULL DEFAULT 0,
  `turno` char(2) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrep
CREATE TABLE IF NOT EXISTS `mxrep` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `zona` char(200) NOT NULL DEFAULT '',
  `cod_art` int(5) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ZONA` (`zona`),
  KEY `COD_ART` (`cod_art`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxres
CREATE TABLE IF NOT EXISTS `mxres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_ing` date NOT NULL DEFAULT '0000-00-00',
  `numero` decimal(10,0) NOT NULL DEFAULT 0,
  `cod_ext` char(40) NOT NULL DEFAULT '',
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `hora` char(10) NOT NULL DEFAULT '',
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `cli_nom` char(60) NOT NULL DEFAULT '',
  `cli_tel` char(40) NOT NULL DEFAULT '',
  `cli_mail` char(180) NOT NULL DEFAULT '',
  `cubiertos` int(3) NOT NULL DEFAULT 0,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `valor_cub` decimal(16,2) NOT NULL DEFAULT 0.00,
  `total_cub` decimal(16,2) NOT NULL DEFAULT 0.00,
  `sena` decimal(16,2) NOT NULL DEFAULT 0.00,
  `observac` char(80) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `mozo` int(4) NOT NULL DEFAULT 0,
  `asistida` bit(1) NOT NULL DEFAULT b'0',
  `cod_dto` int(2) NOT NULL DEFAULT 0,
  `cod_soc` int(4) NOT NULL DEFAULT 0,
  `referencia` char(40) NOT NULL DEFAULT '',
  `envio` int(8) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `NUMERO` (`numero`),
  KEY `COD_EXT` (`cod_ext`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_USU` (`cod_usu`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `COD_ART` (`cod_art`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MESA` (`mesa`),
  KEY `ASISTIDA` (`asistida`),
  KEY `COD_DTO` (`cod_dto`),
  KEY `COD_SOC` (`cod_soc`),
  KEY `FECTUR` (`fecha`,`turno`,`cod_ctv`,`mesa`),
  KEY `BUK` (`fecha`,`turno`,`cli_mail`,`cli_tel`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrga
CREATE TABLE IF NOT EXISTS `mxrga` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(40) NOT NULL DEFAULT '',
  `calc_rent` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrlj
CREATE TABLE IF NOT EXISTS `mxrlj` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `hora_llam` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `hora_lleg` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `tipo` char(2) NOT NULL DEFAULT '',
  `noaviso` bit(1) NOT NULL DEFAULT b'0',
  `idfint` decimal(10,0) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `MESA` (`cod_ctv`,`mesa`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrmovtip
CREATE TABLE IF NOT EXISTS `mxrmovtip` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` char(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrua
CREATE TABLE IF NOT EXISTS `mxrua` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(3) NOT NULL DEFAULT 0,
  `nombre` char(40) NOT NULL DEFAULT '',
  `color` decimal(10,0) NOT NULL DEFAULT 0,
  `grupo_nro` int(3) NOT NULL DEFAULT 0,
  `grupo_col` decimal(10,0) NOT NULL DEFAULT 0,
  `grupo_fot` char(255) NOT NULL DEFAULT '',
  `excluyeinf` bit(1) NOT NULL DEFAULT b'0',
  `evento` char(2) NOT NULL DEFAULT '',
  `deliact` bit(1) NOT NULL DEFAULT b'0',
  `eve_for` char(12) NOT NULL DEFAULT '',
  `eve_form` char(12) NOT NULL DEFAULT '',
  `eve_formh` char(12) NOT NULL DEFAULT '',
  `discont` bit(1) NOT NULL DEFAULT b'0',
  `fotoblob` blob NOT NULL DEFAULT '',
  `fecha_update` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `modo_vista` char(1) NOT NULL DEFAULT 'C',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `FECHA_UPDATE` (`fecha_update`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxrui
CREATE TABLE IF NOT EXISTS `mxrui` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(3) NOT NULL DEFAULT 0,
  `nombre` char(40) NOT NULL DEFAULT '',
  `cod_cga` int(3) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `COD_CGA` (`cod_cga`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxsec
CREATE TABLE IF NOT EXISTS `mxsec` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(8) NOT NULL DEFAULT '',
  `nombre` char(40) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `dias` char(14) NOT NULL DEFAULT '',
  `turno` char(2) NOT NULL DEFAULT '',
  `mesas` mediumtext NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `TURNO` (`turno`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxser
CREATE TABLE IF NOT EXISTS `mxser` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(1) NOT NULL DEFAULT '',
  `nombre` char(100) NOT NULL DEFAULT '',
  `descripcion` char(1) NOT NULL DEFAULT '',
  `imagen1` mediumtext NOT NULL DEFAULT '',
  `imagen2` mediumtext NOT NULL DEFAULT '',
  `tipoimg` char(1) NOT NULL DEFAULT '',
  `archivo` mediumtext NOT NULL DEFAULT '',
  `nom_arch` char(100) NOT NULL DEFAULT '',
  `url` char(200) NOT NULL DEFAULT '',
  `horde` int(1) NOT NULL DEFAULT 0,
  `fecha` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `orden` int(2) NOT NULL DEFAULT 0,
  `no_leido` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `ORDEN` (`orden`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxset
CREATE TABLE IF NOT EXISTS `mxset` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `var` char(100) NOT NULL DEFAULT '',
  `valor` char(100) NOT NULL DEFAULT '',
  `original` char(20) NOT NULL DEFAULT '',
  `tipo` char(20) NOT NULL DEFAULT '',
  `nombre` char(80) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `VAR` (`var`)
) ENGINE=InnoDB AUTO_INCREMENT=112 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxsev
CREATE TABLE IF NOT EXISTS `mxsev` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_eve` int(8) NOT NULL DEFAULT 0,
  `cod_sal` char(6) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_EVE` (`cod_eve`),
  KEY `COD_SAL` (`cod_sal`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxshell
CREATE TABLE IF NOT EXISTS `mxshell` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `processid` int(6) NOT NULL,
  `cod_ter` int(9) NOT NULL,
  `proceso` char(20) NOT NULL,
  `fecha` date NOT NULL,
  `hora` char(10) NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `hora_fin` char(10) DEFAULT NULL,
  `time_out` int(9) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PROCESSID` (`processid`),
  KEY `COD_TER` (`cod_ter`),
  KEY `PROCESO` (`proceso`)
) ENGINE=InnoDB AUTO_INCREMENT=29501 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxsoc
CREATE TABLE IF NOT EXISTS `mxsoc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(4) NOT NULL DEFAULT 0,
  `nombre` char(100) NOT NULL DEFAULT '',
  `tipo` char(2) NOT NULL DEFAULT '',
  `referencia` char(40) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `REFERENCIA` (`referencia`),
  KEY `TIPOREF` (`tipo`,`referencia`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxsop
CREATE TABLE IF NOT EXISTS `mxsop` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cli` int(5) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `tipo` char(2) NOT NULL DEFAULT '',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `hora_ini` char(10) NOT NULL DEFAULT '',
  `hora_fin` char(10) NOT NULL DEFAULT '',
  `motivo` char(30) NOT NULL DEFAULT '',
  `detalle` mediumtext NOT NULL DEFAULT '',
  `ultfec` date NOT NULL DEFAULT '0000-00-00',
  `ulthor` char(10) NOT NULL DEFAULT '',
  `ultusu` int(4) NOT NULL DEFAULT 0,
  `estado` int(3) NOT NULL DEFAULT 0,
  `vis_fec` date NOT NULL DEFAULT '0000-00-00',
  `his_est` mediumtext NOT NULL DEFAULT '',
  `vis_hore` char(10) NOT NULL DEFAULT '',
  `vis_hors` char(10) NOT NULL DEFAULT '',
  `vis_emp` int(4) NOT NULL DEFAULT 0,
  `cobrar` decimal(10,0) NOT NULL DEFAULT 0,
  `confirm` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `FECHA` (`fecha`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `CLIFEC` (`cod_cli`,`fecha`),
  KEY `ESTFEC` (`estado`,`fecha`),
  KEY `FECEMPHOR` (`vis_fec`,`vis_emp`,`vis_hore`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxsrv
CREATE TABLE IF NOT EXISTS `mxsrv` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` char(200) NOT NULL DEFAULT '',
  `host` char(200) NOT NULL DEFAULT '',
  `port` int(5) NOT NULL DEFAULT 0,
  `user` char(200) NOT NULL DEFAULT '',
  `pass` char(200) NOT NULL DEFAULT '',
  `cod_prd` char(10) NOT NULL DEFAULT '',
  `principal` int(1) NOT NULL DEFAULT 0,
  `hostws` char(90) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `NOMBRE` (`nombre`),
  KEY `COD_PRD` (`cod_prd`),
  KEY `PRINCIPAL` (`principal`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxsta
CREATE TABLE IF NOT EXISTS `mxsta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `cod_ins` int(5) NOT NULL DEFAULT 0,
  `cantidad` decimal(11,3) NOT NULL DEFAULT 0.000,
  `art_cant` decimal(11,3) NOT NULL DEFAULT 0.000,
  `precart` decimal(16,2) NOT NULL DEFAULT 0.00,
  `turno` char(2) NOT NULL DEFAULT '',
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `idfint` int(6) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_ART` (`cod_art`),
  KEY `COD_INS` (`cod_ins`),
  KEY `TURNO` (`turno`),
  KEY `FECHA` (`fecha`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `NUMERO3` (`numero3`),
  KEY `REG2` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`),
  KEY `REG3` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxstk
CREATE TABLE IF NOT EXISTS `mxstk` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ins` int(5) NOT NULL DEFAULT 0,
  `cod_dep` char(2) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `stock_ini` decimal(13,3) NOT NULL DEFAULT 0.000,
  `ventas` decimal(13,3) NOT NULL DEFAULT 0.000,
  `compras` decimal(13,3) NOT NULL DEFAULT 0.000,
  `movim` decimal(13,3) NOT NULL DEFAULT 0.000,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_INS` (`cod_ins`),
  KEY `COD_DEP` (`cod_dep`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `FECHA` (`fecha`),
  KEY `INSDEPFEC` (`cod_ins`,`cod_dep`,`fecha`),
  KEY `INSFEC` (`cod_ins`,`fecha`),
  KEY `INDESUFEC` (`cod_ins`,`cod_dep`,`cod_suc`,`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxsua
CREATE TABLE IF NOT EXISTS `mxsua` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(3) NOT NULL DEFAULT 0,
  `nombre` char(40) NOT NULL DEFAULT '',
  `deliact` bit(1) NOT NULL DEFAULT b'0',
  `eve_for` char(12) NOT NULL DEFAULT '',
  `eve_form` char(12) NOT NULL DEFAULT '',
  `eve_formh` char(12) NOT NULL DEFAULT '',
  `fecha_update` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `FECHA_UPDATE` (`fecha_update`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxsuc
CREATE TABLE IF NOT EXISTS `mxsuc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(5) NOT NULL DEFAULT 0,
  `nombre` char(60) NOT NULL DEFAULT '',
  `telefono` char(30) NOT NULL DEFAULT '',
  `calle` char(80) NOT NULL DEFAULT '',
  `altura` char(12) NOT NULL DEFAULT '',
  `localidad` char(60) NOT NULL DEFAULT '',
  `provincia` char(60) NOT NULL DEFAULT '',
  `cod_grs` int(5) NOT NULL DEFAULT 0,
  `geoloc` char(100) NOT NULL DEFAULT '',
  `ms_codcli` int(5) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `COD_GRS` (`cod_grs`),
  KEY `MS_CODCLI` (`ms_codcli`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtablalog
CREATE TABLE IF NOT EXISTS `mxtablalog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tabla` char(30) NOT NULL DEFAULT '',
  `checksum` char(40) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `TABLA` (`tabla`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtec
CREATE TABLE IF NOT EXISTS `mxtec` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(3) NOT NULL DEFAULT 0,
  `tecla` char(30) NOT NULL DEFAULT '',
  `nombre` char(20) NOT NULL DEFAULT '',
  `descrip` char(60) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `DESCRIP` (`descrip`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtel
CREATE TABLE IF NOT EXISTS `mxtel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(2) NOT NULL DEFAULT 0,
  `nombre` char(60) NOT NULL DEFAULT '',
  `numero` char(40) NOT NULL DEFAULT '',
  `puerto` int(2) NOT NULL DEFAULT 0,
  `llamada` char(40) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `NUMERO` (`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxter
CREATE TABLE IF NOT EXISTS `mxter` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(4) NOT NULL DEFAULT 0,
  `nombre` char(200) NOT NULL DEFAULT '',
  `idregistro` char(50) NOT NULL DEFAULT '',
  `tersrv` bit(1) NOT NULL DEFAULT b'0',
  `dobleexe` bit(1) NOT NULL DEFAULT b'0',
  `sinconex` bit(1) NOT NULL DEFAULT b'0',
  `noadmin` bit(1) NOT NULL DEFAULT b'0',
  `ultactpg` date NOT NULL DEFAULT '0000-00-00',
  `ingresoadi` bit(1) NOT NULL DEFAULT b'0',
  `termozos` bit(1) NOT NULL DEFAULT b'0',
  `termnofactu` bit(1) NOT NULL DEFAULT b'0',
  `termnocob` bit(1) NOT NULL DEFAULT b'0',
  `termnotecl` bit(1) NOT NULL DEFAULT b'0',
  `termnoadic` bit(1) NOT NULL DEFAULT b'0',
  `termfactu` bit(1) NOT NULL DEFAULT b'0',
  `termhuella` bit(1) NOT NULL DEFAULT b'0',
  `accmod` int(6) NOT NULL DEFAULT 0,
  `actctv` char(60) NOT NULL DEFAULT '',
  `nodoc` bit(1) NOT NULL DEFAULT b'0',
  `obscompra` bit(1) NOT NULL DEFAULT b'0',
  `termdepo` char(4) NOT NULL DEFAULT '',
  `planoini` char(4) NOT NULL DEFAULT '',
  `sucursal` char(4) NOT NULL DEFAULT '',
  `entsalemp` bit(1) NOT NULL DEFAULT b'0',
  `dirimpre` char(4) NOT NULL DEFAULT '',
  `cheqadicion` bit(1) NOT NULL DEFAULT b'0',
  `procauto` char(4) NOT NULL DEFAULT '',
  `actdatos` bit(1) NOT NULL DEFAULT b'0',
  `ultuso` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `ip` char(40) NOT NULL DEFAULT '',
  `detalle` mediumtext NOT NULL DEFAULT '',
  `keep_alive` time NOT NULL DEFAULT '00:00:00',
  `procid` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`),
  KEY `IDREGISTRO` (`idregistro`),
  KEY `ULTACTPG` (`ultactpg`),
  KEY `PLANOINI` (`planoini`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxteremp
CREATE TABLE IF NOT EXISTS `mxteremp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `cod_ter` int(4) NOT NULL DEFAULT 0,
  `ip` char(20) NOT NULL DEFAULT '',
  `fecha_ini` date NOT NULL DEFAULT '0000-00-00',
  `hora_ini` time NOT NULL DEFAULT '00:00:00',
  `conid` char(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_TER` (`cod_ter`)
) ENGINE=InnoDB AUTO_INCREMENT=204 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtergw
CREATE TABLE IF NOT EXISTS `mxtergw` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_for` char(1) NOT NULL,
  `cod_gw` int(4) NOT NULL,
  `cod_ter` int(4) NOT NULL,
  `pos_id` char(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `COD_FOR` (`cod_for`),
  KEY `COD_GW` (`cod_gw`),
  KEY `COD_TER` (`cod_ter`),
  KEY `POS_ID` (`pos_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtipimp
CREATE TABLE IF NOT EXISTS `mxtipimp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` char(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtiponot
CREATE TABLE IF NOT EXISTS `mxtiponot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(10) NOT NULL,
  `descripcion` char(50) DEFAULT '',
  `time_out` int(8) DEFAULT 60,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtmprec
CREATE TABLE IF NOT EXISTS `mxtmprec` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_art` int(6) NOT NULL DEFAULT 0,
  `cod_ins` int(6) NOT NULL DEFAULT 0,
  `cantidad` decimal(11,3) NOT NULL DEFAULT 0.000,
  `observac` char(30) NOT NULL DEFAULT '',
  `bloq` bit(1) NOT NULL DEFAULT b'0',
  `cod_sec` int(3) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_ART` (`cod_art`),
  KEY `COD_INS` (`cod_ins`),
  KEY `COD_SEC` (`cod_sec`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtuaud
CREATE TABLE IF NOT EXISTS `mxtuaud` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `hora_ape` char(10) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `detalle` mediumtext NOT NULL DEFAULT '',
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `envio` int(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_USU` (`cod_usu`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `NUMERO3` (`numero3`)
) ENGINE=InnoDB AUTO_INCREMENT=12822 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtucaj
CREATE TABLE IF NOT EXISTS `mxtucaj` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `numero` int(3) NOT NULL DEFAULT 0,
  `detalle` char(70) NOT NULL DEFAULT '',
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tipo` char(4) NOT NULL DEFAULT '',
  `referencia` char(36) NOT NULL DEFAULT '',
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `envio` int(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `NUMERO` (`numero`),
  KEY `REFERENCIA` (`referencia`),
  KEY `COD_USU` (`cod_usu`),
  KEY `PREFIJO` (`prefijo`),
  KEY `REG` (`fecha`,`turno`,`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtucm2
CREATE TABLE IF NOT EXISTS `mxtucm2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `hora_ped` char(16) NOT NULL DEFAULT '',
  `duracion` int(5) NOT NULL DEFAULT 0,
  `numero` int(6) NOT NULL DEFAULT 0,
  `origen` char(2) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `mozo` int(4) NOT NULL DEFAULT 0,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `cantidad` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cubiertos` decimal(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `NUMERO` (`numero`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_ART` (`cod_art`),
  KEY `FECTUR` (`fecha`,`turno`),
  KEY `REG` (`fecha`,`turno`,`cod_ctv`,`mesa`,`cod_art`),
  KEY `FECTURNUM` (`fecha`,`turno`,`numero`)
) ENGINE=InnoDB AUTO_INCREMENT=57816 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtuctc
CREATE TABLE IF NOT EXISTS `mxtuctc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cod_for` char(2) NOT NULL DEFAULT '',
  `numtarj` decimal(16,0) NOT NULL DEFAULT 0,
  `cupon` decimal(10,0) NOT NULL DEFAULT 0,
  `lote` int(4) NOT NULL DEFAULT 0,
  `cuotas` int(3) NOT NULL DEFAULT 0,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `pago` char(2) NOT NULL DEFAULT '',
  `referencia` char(36) NOT NULL DEFAULT '',
  `recibo` int(8) NOT NULL DEFAULT 0,
  `cobrador` int(4) NOT NULL DEFAULT 0,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `desde` char(2) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_FOR` (`cod_for`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `RECIBO` (`recibo`),
  KEY `NUMERO3` (`numero3`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`),
  KEY `CLIREG` (`cod_cli`,`cod_cpb`,`prefijo`,`numero`),
  KEY `REG2` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`),
  KEY `REG3` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`),
  KEY `CLIREG3` (`cod_cli`,`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`)
) ENGINE=InnoDB AUTO_INCREMENT=13826 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtuctr
CREATE TABLE IF NOT EXISTS `mxtuctr` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `hora` char(10) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `cubiertos` int(3) NOT NULL DEFAULT 0,
  `total` decimal(16,2) NOT NULL DEFAULT 0.00,
  `referencia` char(40) NOT NULL DEFAULT '',
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_USU` (`cod_usu`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`)
) ENGINE=InnoDB AUTO_INCREMENT=11206 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtuelec
CREATE TABLE IF NOT EXISTS `mxtuelec` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pago` int(4) NOT NULL,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `hora` char(5) NOT NULL,
  `cod_for` char(1) NOT NULL,
  `cod_gw` int(4) NOT NULL,
  `cod_ter` int(4) NOT NULL,
  `cod_ctv` char(2) NOT NULL,
  `mesa` char(4) NOT NULL,
  `orden` int(3) NOT NULL,
  `turno` char(2) NOT NULL,
  `cod_cpb` char(2) NOT NULL,
  `prefijo` int(4) NOT NULL,
  `numero` int(8) NOT NULL,
  `cod_loc` int(4) NOT NULL,
  `numero3` int(12) NOT NULL,
  `tipo_oper` char(25) NOT NULL,
  `pago_ref` char(50) NOT NULL,
  `intento` int(4) NOT NULL,
  `importe` decimal(14,2) NOT NULL,
  `estado` char(20) NOT NULL,
  `estadogw` char(20) NOT NULL,
  `orderdata` mediumtext NOT NULL,
  `payment_id` char(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ID_PAGO` (`id_pago`),
  KEY `COD_FOR` (`cod_for`),
  KEY `COD_GW` (`cod_gw`),
  KEY `COD_TER` (`cod_ter`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MESA` (`mesa`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtufac
CREATE TABLE IF NOT EXISTS `mxtufac` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `fecha_ent` date NOT NULL DEFAULT '0000-00-00',
  `hora_ent` char(10) NOT NULL DEFAULT '',
  `hora_sal` char(10) NOT NULL DEFAULT '',
  `hora_rep` char(10) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `fecha_fis` date NOT NULL DEFAULT '0000-00-00',
  `hora_fis` char(12) NOT NULL DEFAULT '',
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `cod_call` char(8) NOT NULL DEFAULT '',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `cubiertos` int(3) NOT NULL DEFAULT 0,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `nom_cli` char(100) NOT NULL DEFAULT '',
  `raz_cli` char(70) NOT NULL DEFAULT '',
  `localidad` char(30) NOT NULL DEFAULT '',
  `provincia` char(30) NOT NULL DEFAULT '',
  `tipo_iva` char(2) NOT NULL DEFAULT '',
  `cuit` char(26) NOT NULL DEFAULT '',
  `cod_rep` int(4) NOT NULL DEFAULT 0,
  `cod_dto` int(2) NOT NULL DEFAULT 0,
  `imp_dto` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `total` decimal(16,2) NOT NULL DEFAULT 0.00,
  `neto1` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tasa1` decimal(7,2) NOT NULL DEFAULT 0.00,
  `iva1` decimal(16,2) NOT NULL DEFAULT 0.00,
  `neto2` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tasa2` decimal(7,2) NOT NULL DEFAULT 0.00,
  `iva2` decimal(16,2) NOT NULL DEFAULT 0.00,
  `neto3` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tasa3` decimal(7,2) NOT NULL DEFAULT 0.00,
  `iva3` decimal(16,2) NOT NULL DEFAULT 0.00,
  `imp_int` decimal(16,2) NOT NULL DEFAULT 0.00,
  `trans` char(26) NOT NULL DEFAULT '',
  `puntos` int(7) NOT NULL DEFAULT 0,
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `var1` char(20) NOT NULL DEFAULT '',
  `var2` char(20) NOT NULL DEFAULT '',
  `var3` char(20) NOT NULL DEFAULT '',
  `id_pape` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_CALL` (`cod_call`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `COD_REP` (`cod_rep`),
  KEY `COD_DTO` (`cod_dto`),
  KEY `COD_USU` (`cod_usu`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `NUMERO3` (`numero3`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`),
  KEY `REG2` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`),
  KEY `CPBPTOSUC` (`cod_cpb`,`prefijo`,`cod_suc`),
  KEY `REG3` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`),
  KEY `CLIREG3` (`cod_cli`,`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`)
) ENGINE=InnoDB AUTO_INCREMENT=13812 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtuipa
CREATE TABLE IF NOT EXISTS `mxtuipa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ctv` char(1) NOT NULL,
  `mesa` char(4) NOT NULL,
  `cod_cpb` char(1) NOT NULL,
  `prefijo` int(4) NOT NULL,
  `numero` int(8) NOT NULL,
  `cod_for` char(1) NOT NULL,
  `importe` decimal(16,2) NOT NULL,
  `cuotas` int(3) NOT NULL,
  `cupon` int(10) NOT NULL,
  `lote` int(4) NOT NULL,
  `numtarj` int(16) NOT NULL,
  `cod_loc` int(4) NOT NULL,
  `fecha` date NOT NULL,
  `hora` char(5) NOT NULL,
  `aplicada` bit(1) NOT NULL,
  `propina` decimal(16,2) NOT NULL,
  `idsql` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MESA` (`mesa`),
  KEY `IDSQL` (`idsql`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtuite
CREATE TABLE IF NOT EXISTS `mxtuite` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `cantidad` decimal(11,3) NOT NULL DEFAULT 0.000,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `precio` decimal(16,2) NOT NULL DEFAULT 0.00,
  `padre` int(2) NOT NULL DEFAULT 0,
  `hijo` int(2) NOT NULL DEFAULT 0,
  `tipo_rel` char(2) NOT NULL DEFAULT '',
  `puntos` int(6) NOT NULL DEFAULT 0,
  `remito` bit(1) NOT NULL DEFAULT b'0',
  `cod_dto` int(2) NOT NULL DEFAULT 0,
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `imp_dto` decimal(16,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_ART` (`cod_art`),
  KEY `PADRE` (`padre`),
  KEY `HIJO` (`hijo`),
  KEY `TIPO_REL` (`tipo_rel`),
  KEY `COD_DTO` (`cod_dto`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `NUMERO3` (`numero3`),
  KEY `REG` (`cod_cpb`,`prefijo`,`numero`),
  KEY `REG2` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`),
  KEY `REG3` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`)
) ENGINE=InnoDB AUTO_INCREMENT=44685 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtumvs
CREATE TABLE IF NOT EXISTS `mxtumvs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `cod_cmo` int(2) NOT NULL DEFAULT 0,
  `cod_dep` char(2) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `remito` int(8) NOT NULL DEFAULT 0,
  `artins` char(2) NOT NULL DEFAULT '',
  `codigo` int(5) NOT NULL DEFAULT 0,
  `cantidad` decimal(11,3) NOT NULL DEFAULT 0.000,
  `precio` decimal(16,2) NOT NULL DEFAULT 0.00,
  `facturado` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `PREFIJO` (`prefijo`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_CMO` (`cod_cmo`),
  KEY `COD_DEP` (`cod_dep`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `CODIGO` (`codigo`),
  KEY `REG` (`fecha`,`turno`,`remito`,`artins`),
  KEY `REMCOD` (`remito`,`codigo`,`artins`,`precio`),
  KEY `REG2` (`fecha`,`turno`,`remito`,`artins`,`cod_suc`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtupadi
CREATE TABLE IF NOT EXISTS `mxtupadi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_ape` int(11) NOT NULL DEFAULT 0,
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `mesa_mrest` char(8) NOT NULL DEFAULT '',
  `cantidad` decimal(11,3) NOT NULL DEFAULT 0.000,
  `cod_art` decimal(10,0) NOT NULL DEFAULT 0,
  `nombre` char(30) NOT NULL DEFAULT '',
  `precio` decimal(11,3) NOT NULL DEFAULT 0.000,
  `detalle` char(100) NOT NULL DEFAULT '',
  `hora` char(10) NOT NULL DEFAULT '',
  `orden` int(4) NOT NULL DEFAULT 0,
  `padre` int(4) NOT NULL DEFAULT 0,
  `hijo` int(4) NOT NULL DEFAULT 0,
  `tipo_rel` char(1) NOT NULL DEFAULT '',
  `procesado` bit(1) NOT NULL DEFAULT b'0',
  `fecha_new` date NOT NULL DEFAULT '0000-00-00',
  `fecha_update` date NOT NULL DEFAULT '0000-00-00',
  `marcha` bit(1) NOT NULL DEFAULT b'0',
  `codigo_externo` char(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `ID_APE` (`id_ape`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MESA` (`mesa`),
  KEY `MESA_MREST` (`mesa_mrest`),
  KEY `COD_ART` (`cod_art`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtupape
CREATE TABLE IF NOT EXISTS `mxtupape` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `mesa_mrest` char(8) NOT NULL DEFAULT '',
  `mozo` int(4) NOT NULL DEFAULT 0,
  `repartidor` int(4) NOT NULL DEFAULT 0,
  `hora` char(10) NOT NULL DEFAULT '',
  `cod_dto` int(2) NOT NULL DEFAULT 0,
  `tipo_dto` char(2) NOT NULL DEFAULT '',
  `valor_dto` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `nom_cli` char(200) NOT NULL DEFAULT '',
  `ape_cli` char(60) NOT NULL DEFAULT '',
  `mail_cli` char(60) NOT NULL DEFAULT '',
  `dni_cli` char(30) NOT NULL DEFAULT '',
  `tel_cli` char(40) NOT NULL DEFAULT '',
  `obs_cli` char(120) NOT NULL DEFAULT '',
  `observa` char(120) NOT NULL DEFAULT '',
  `procesado` bit(1) NOT NULL DEFAULT b'0',
  `fecha_new` date NOT NULL DEFAULT '0000-00-00',
  `fecha_update` date NOT NULL DEFAULT '0000-00-00',
  `pagado` bit(1) NOT NULL DEFAULT b'0',
  `tienda` char(40) NOT NULL DEFAULT '',
  `id_partner` char(10) NOT NULL DEFAULT '',
  `ref_partner` char(20) NOT NULL DEFAULT '',
  `codigo_externo` char(100) NOT NULL DEFAULT '',
  `calle` char(40) NOT NULL DEFAULT '',
  `numero` char(10) NOT NULL DEFAULT '',
  `piso` char(10) NOT NULL DEFAULT '',
  `cod_pos` char(10) NOT NULL DEFAULT '',
  `localidad` char(40) NOT NULL DEFAULT '',
  `estado` char(20) NOT NULL DEFAULT '',
  `condelivery` bit(1) NOT NULL DEFAULT b'0',
  `condeliveryext` bit(1) NOT NULL DEFAULT b'0',
  `motivorechazo` char(10) NOT NULL DEFAULT '',
  `codtiempodely` char(10) NOT NULL DEFAULT '',
  `fecharetiro` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `nuevocli` bit(1) NOT NULL DEFAULT b'0',
  `posdatado` bit(1) NOT NULL DEFAULT b'0',
  `pagacon` decimal(20,2) NOT NULL DEFAULT 0.00,
  `idtrans` char(50) NOT NULL DEFAULT '',
  `pickup` char(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PEDIDO` (`id_partner`,`codigo_externo`,`ref_partner`),
  KEY `PROCESADO` (`procesado`),
  KEY `PAGADO` (`pagado`),
  KEY `REF_PARTNER` (`ref_partner`),
  KEY `COD_POS` (`cod_pos`),
  KEY `ID` (`id`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `MESA` (`mesa`),
  KEY `MESA_MREST` (`mesa_mrest`),
  KEY `MOZO` (`mozo`),
  KEY `REPARTIDOR` (`repartidor`),
  KEY `COD_DTO` (`cod_dto`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `NOM_CLI` (`nom_cli`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtupdto
CREATE TABLE IF NOT EXISTS `mxtupdto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_ape` int(11) NOT NULL,
  `tipo_dto` char(1) NOT NULL DEFAULT '',
  `valor_dto` decimal(14,2) NOT NULL DEFAULT 0.00,
  `monto_dto` decimal(14,2) NOT NULL DEFAULT 0.00,
  `nom_dto` char(15) NOT NULL DEFAULT '',
  `nota_dto` char(30) NOT NULL DEFAULT '',
  `prioridad` int(4) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  PRIMARY KEY (`id`),
  KEY `ID_APE` (`id_ape`),
  KEY `FECHA` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxturcjc
CREATE TABLE IF NOT EXISTS `mxturcjc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `diferencia` decimal(16,2) NOT NULL DEFAULT 0.00,
  `compensa` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `PREFIJO` (`prefijo`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_USU` (`cod_usu`),
  KEY `REG` (`fecha`,`turno`,`prefijo`,`cod_suc`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxturcjm
CREATE TABLE IF NOT EXISTS `mxturcjm` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `cod_for` char(2) NOT NULL DEFAULT '',
  `cod_mon` int(5) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cantidad` decimal(10,0) NOT NULL DEFAULT 0,
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `PREFIJO` (`prefijo`),
  KEY `COD_FOR` (`cod_for`),
  KEY `COD_MON` (`cod_mon`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_USU` (`cod_usu`),
  KEY `FORMON` (`cod_for`,`cod_mon`),
  KEY `REG` (`fecha`,`turno`,`prefijo`,`cod_suc`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxturen
CREATE TABLE IF NOT EXISTS `mxturen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `cod_for` char(2) NOT NULL DEFAULT '',
  `valor` decimal(14,2) NOT NULL DEFAULT 0.00,
  `cantidad` int(4) NOT NULL DEFAULT 0,
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `venta` decimal(16,2) NOT NULL DEFAULT 0.00,
  `hora` char(18) NOT NULL DEFAULT '',
  `cod_usu` int(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `COD_FOR` (`cod_for`),
  KEY `COD_USU` (`cod_usu`),
  KEY `REG` (`cod_emp`,`fecha`,`turno`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxturenest
CREATE TABLE IF NOT EXISTS `mxturenest` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_emp` int(11) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `hora` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `estado` int(1) NOT NULL DEFAULT 0,
  `cod_usu` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxturenmov
CREATE TABLE IF NOT EXISTS `mxturenmov` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_caj` int(11) NOT NULL DEFAULT 0,
  `id_ctc` int(11) NOT NULL DEFAULT 0,
  `id_ren` int(11) NOT NULL DEFAULT 0,
  `cod_for` char(2) NOT NULL DEFAULT '',
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `hora` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `tipo` int(5) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxturlj
CREATE TABLE IF NOT EXISTS `mxturlj` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `turno` char(2) NOT NULL DEFAULT '',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_ctv` char(2) NOT NULL DEFAULT '',
  `mesa` char(8) NOT NULL DEFAULT '',
  `cod_emp` int(4) NOT NULL DEFAULT 0,
  `hora_llam` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `hora_lleg` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `tipo` char(2) NOT NULL DEFAULT '',
  `noaviso` bit(1) NOT NULL DEFAULT b'0',
  `idfint` decimal(10,0) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FECHA` (`fecha`),
  KEY `TURNO` (`turno`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_CTV` (`cod_ctv`),
  KEY `COD_EMP` (`cod_emp`),
  KEY `MESA` (`cod_ctv`,`mesa`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxtusta
CREATE TABLE IF NOT EXISTS `mxtusta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_art` int(5) NOT NULL DEFAULT 0,
  `cod_ins` int(5) NOT NULL DEFAULT 0,
  `cantidad` decimal(11,3) NOT NULL DEFAULT 0.000,
  `art_cant` decimal(11,3) NOT NULL DEFAULT 0.000,
  `precart` decimal(16,2) NOT NULL DEFAULT 0.00,
  `turno` char(2) NOT NULL DEFAULT '',
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `cod_cpb` char(2) NOT NULL DEFAULT '',
  `prefijo` int(4) NOT NULL DEFAULT 0,
  `numero` int(8) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `cod_loc` int(4) NOT NULL DEFAULT 0,
  `numero3` decimal(12,0) NOT NULL DEFAULT 0,
  `idfint` int(6) NOT NULL DEFAULT 0,
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `TURNO` (`turno`),
  KEY `FECHA` (`fecha`),
  KEY `COD_CPB` (`cod_cpb`),
  KEY `PREFIJO` (`prefijo`),
  KEY `NUMERO` (`numero`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `COD_LOC` (`cod_loc`),
  KEY `NUMERO3` (`numero3`),
  KEY `COD_ART` (`cod_art`),
  KEY `COD_INS` (`cod_ins`),
  KEY `REG2` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`),
  KEY `REG3` (`cod_cpb`,`prefijo`,`numero`,`cod_suc`,`cod_loc`,`numero3`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxutilfild
CREATE TABLE IF NOT EXISTS `mxutilfild` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_file` int(4) NOT NULL,
  `archivo` mediumtext NOT NULL,
  `parte` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `COD_FILE` (`cod_file`),
  KEY `PARTE` (`parte`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxutilfile
CREATE TABLE IF NOT EXISTS `mxutilfile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(4) NOT NULL,
  `nombre` char(60) NOT NULL,
  `size` char(15) NOT NULL,
  `partes` int(5) NOT NULL,
  `tipo_app` int(1) NOT NULL,
  `detalle` char(200) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `TIPO_APP` (`tipo_app`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxvar
CREATE TABLE IF NOT EXISTS `mxvar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` char(6) NOT NULL DEFAULT '',
  `nombre` char(50) NOT NULL DEFAULT '',
  `tipo` char(6) NOT NULL DEFAULT '',
  `valor1` char(100) NOT NULL DEFAULT '',
  `valor2` char(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `CODIGO` (`codigo`),
  KEY `NOMBRE` (`nombre`),
  KEY `TIPCOD` (`tipo`,`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=1251 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxvec
CREATE TABLE IF NOT EXISTS `mxvec` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recibo` int(8) NOT NULL DEFAULT 0,
  `numero` decimal(10,0) NOT NULL DEFAULT 0,
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  `banco` char(40) NOT NULL DEFAULT '',
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `cod_cli` int(7) NOT NULL DEFAULT 0,
  `importe` decimal(16,2) NOT NULL DEFAULT 0.00,
  `tipo` char(2) NOT NULL DEFAULT '',
  `referencia` char(34) NOT NULL DEFAULT '',
  `envio` int(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `NUMERO` (`numero`),
  KEY `COD_SUC` (`cod_suc`),
  KEY `FECHA` (`fecha`),
  KEY `COD_CLI` (`cod_cli`),
  KEY `ENVIO` (`envio`),
  KEY `REG` (`fecha`,`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxver
CREATE TABLE IF NOT EXISTS `mxver` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(9) NOT NULL,
  `version` int(5) NOT NULL,
  `subversion` int(5) NOT NULL,
  `revision` int(5) NOT NULL,
  `critica` bit(1) NOT NULL,
  `cant_arch` int(5) NOT NULL,
  `size` int(9) NOT NULL,
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `doctor` bit(1) NOT NULL,
  `ver_req` int(9) NOT NULL,
  `fechacreacion` date NOT NULL DEFAULT '0000-00-00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODIGO` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxverfile
CREATE TABLE IF NOT EXISTS `mxverfile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(9) NOT NULL,
  `cod_ver` int(9) NOT NULL,
  `nombre` char(40) NOT NULL,
  `size` int(9) NOT NULL,
  `tipo` char(40) NOT NULL,
  `partes` int(5) NOT NULL,
  `accion` mediumtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxverfiled
CREATE TABLE IF NOT EXISTS `mxverfiled` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_file` int(9) NOT NULL,
  `archivo` mediumtext NOT NULL,
  `parte` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11789 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxverter
CREATE TABLE IF NOT EXISTS `mxverter` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ter` int(9) NOT NULL,
  `cod_ver` int(9) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `COD_TER` (`cod_ter`),
  KEY `COD_VER` (`cod_ver`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxvertere
CREATE TABLE IF NOT EXISTS `mxvertere` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cod_ter` int(9) NOT NULL,
  `cod_ver` int(9) NOT NULL,
  `cantidad` int(2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `COD_TER` (`cod_ter`),
  KEY `COD_VER` (`cod_ver`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mx_52592.mxweb
CREATE TABLE IF NOT EXISTS `mxweb` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` char(50) NOT NULL DEFAULT '',
  `tipo` char(6) NOT NULL DEFAULT '',
  `valor1` char(255) NOT NULL DEFAULT '',
  `valor2` mediumtext NOT NULL DEFAULT '',
  `act` bit(1) NOT NULL DEFAULT b'0',
  `cod_suc` int(5) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `COD_SUC` (`cod_suc`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para función mx_52592.Nom_Pago
DELIMITER //
CREATE FUNCTION `Nom_Pago`(`cTipFor` CHAR(2),`CodCpb` CHAR(2),`nPrefijo` INT(4),`nNumero` INT(8)) RETURNS char(50) CHARSET latin1
BEGIN
				DECLARE cValRet CHAR(50);
				DECLARE CtcRef CHAR(36);
				DECLARE CtcPago CHAR(2);
				DECLARE CtcImporte FLOAT(16,2);
				DECLARE NomFor CHAR(30);
				SELECT CTC.Referencia INTO CtcRef FROM MXCTC CTC WHERE CTC.Cod_Cpb = CodCpb AND CTC.Prefijo = nPrefijo AND CTC.Numero = nNumero LIMIT 1 ;
				IF  cTipFor = 'Q' AND CodCpb <> 'P' THEN 
					SELECT CONCAT(TRIM(LEFT(mxvec.Banco, 10)) , ' ' , TRIM(mxvec.Numero)) as Valor INTO cValRet FROM MXVEC WHERE CONCAT(mxvec.fecha, lpad(mxvec.numero, 10, ' ')) = ctcref LIMIT 1 ;
				ELSE
					IF CodCpb = 'P' THEN
						SET cValRet = 'PAGO A CUENTA';
					ELSE
						SELECT Pago INTO CtcPago FROM MXCTC WHERE Cod_Cpb = CodCpb AND Prefijo = nPrefijo AND Numero = nNumero AND TRIM(Pago) != '' limit 1 ;
						IF ctcpago != '' THEN
							SELECT Importe INTO CtcImporte FROM MXCTC WHERE Cod_Cpb = CodCpb AND Prefijo = nPrefijo AND Numero = nNumero LIMIT 1 ;
							IF ctcImporte > 0 THEN
								SET cValRet = CONCAT('N.C. ' , TRIM(ctcref));
							ELSE
								SET cValRet = CONCAT('Aplicada a ' , TRIM(ctcref));
							END IF; 
						ELSE
							SELECT Nombre INTO NomFor FROM MXFOR WHERE Codigo = cTipFor LIMIT 1 ;
							SET cValRet = RPAD(TRIM(NomFor), 50, ' ');
						END IF;
					END IF;
				END IF;
				RETURN cValRet;
			END//
DELIMITER ;

-- Volcando estructura para procedimiento mx_52592.PasarTablaFDT
DELIMITER //
CREATE PROCEDURE `PasarTablaFDT`(
			    IN p_tabla_origen VARCHAR(64),
			    IN p_tabla_destino VARCHAR(64),
			    IN p_idfint INT,
			    IN p_excluir_campos TEXT,
			    OUT p_resultado INT,
			    IN p_fecha VARCHAR(50),
			    IN p_turno INT
			)
BEGIN
			    DECLARE v_campos TEXT;
			    DECLARE v_num_filas BIGINT DEFAULT 0;
			    DECLARE v_columnas_destino TEXT;
			    DECLARE v_columnas_origen TEXT;
				 DECLARE v_fecha DATE;
				 
			    SET p_resultado = 0;
				 SET v_fecha = STR_TO_DATE(p_fecha,'%d/%m/%Y');
				 
			    SELECT GROUP_CONCAT(CONCAT('`', c.COLUMN_NAME, '`') ORDER BY c.ORDINAL_POSITION SEPARATOR ', ')
			      INTO v_campos
			    FROM information_schema.columns c
			    JOIN information_schema.columns d
			      ON d.table_schema = c.table_schema
			     AND d.table_name   = p_tabla_destino
			     AND d.COLUMN_NAME  = c.COLUMN_NAME
			    WHERE c.table_schema = DATABASE()
			      AND c.table_name   = p_tabla_origen
			      AND c.COLUMN_NAME NOT IN ('id','idfint','fecha','turno')
			      AND (p_excluir_campos IS NULL OR p_excluir_campos = '' OR FIND_IN_SET(c.COLUMN_NAME, p_excluir_campos) = 0);

			    IF v_campos IS NULL OR v_campos = '' THEN
			        SET p_resultado = 0;
			    ELSE
			        SET @v_num_filas = 0;
			        SET @sql_count = CONCAT('SELECT COUNT(*) INTO @v_num_filas FROM `', p_tabla_origen, '`');
			        PREPARE stmt_count FROM @sql_count;
			        EXECUTE stmt_count;
			        DEALLOCATE PREPARE stmt_count;

			        SET v_num_filas = @v_num_filas;

			        IF v_num_filas = 0 THEN
			            SET p_resultado = 1;
			        ELSE
			            IF (p_tabla_origen = 'mxtuctc' AND p_tabla_destino = 'mxctc') 
			               OR (p_tabla_origen = 'mxtucaj' AND p_tabla_destino = 'mxcaj') THEN
			                SET v_columnas_destino = CONCAT(v_campos, ', idfint, fecha, turno, id_ant');
			                SET v_columnas_origen  = CONCAT(v_campos, ', ', p_idfint, ', ''', v_fecha, ''', ', p_turno, ', id');
							ELSEIF (p_tabla_origen = 'mxtuipa' AND p_tabla_destino = 'mxipa') THEN
						    -- caso nuevo
						    SET v_columnas_destino = CONCAT(v_campos, ', idfint, envio');
						    SET v_columnas_origen  = CONCAT(v_campos, ', ', p_idfint, ', 0'); -- por ejemplo envío=0 default
			            ELSE
			                SET v_columnas_destino = CONCAT(v_campos, ', idfint, fecha, turno');
			                SET v_columnas_origen  = CONCAT(v_campos, ', ', p_idfint, ', ''',  v_fecha, ''', ', p_turno);
			            END IF;

			            SET @v_sql = CONCAT(
			                'INSERT INTO `', p_tabla_destino, '` (', v_columnas_destino, ') ',
			                'SELECT ', v_columnas_origen, ' FROM `', p_tabla_origen, '`'
			            );

			            BEGIN
			                DECLARE EXIT HANDLER FOR SQLEXCEPTION
			                BEGIN
			                    SET p_resultado = -1;
			                END;

			                PREPARE stmt_insert FROM @v_sql;
			                EXECUTE stmt_insert;
			                DEALLOCATE PREPARE stmt_insert;

			                SET p_resultado = 1;
			            END;

			            IF p_resultado = 1 THEN
			                SET @v_sql_delete = CONCAT('DELETE FROM `', p_tabla_origen, '`');
			                PREPARE stmt_delete FROM @v_sql_delete;
			                EXECUTE stmt_delete;
			                DEALLOCATE PREPARE stmt_delete;
			            END IF;
			        END IF;
			    END IF;
			END//
DELIMITER ;

-- Volcando estructura para procedimiento mx_52592.ProcedimientoFDT
DELIMITER //
CREATE PROCEDURE `ProcedimientoFDT`(
	            IN `p_idfint` DECIMAL(10,0),
	            IN `p_fecha` VARCHAR(50),
	            IN `p_turno` INT
	        )
BEGIN
	            DECLARE v_ok_fac INT DEFAULT 0;
	            DECLARE v_ok_ctc INT DEFAULT 0;
	            DECLARE v_ok_ite INT DEFAULT 0;
	            DECLARE v_ok_otros INT DEFAULT 0;

	            START TRANSACTION;

	            -- Tablas críticas
	            CALL PasarTablaFDT('mxtuFac', 'mxFac', p_idfint, 'id,idfint', v_ok_fac,p_fecha,p_turno);
	            IF v_ok_fac < 1 THEN 
	                ROLLBACK;
	                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error crítico: mxtuFac ? mxFac';
	            END IF;

	            CALL PasarTablaFDT('mxtuCtc', 'mxCtc', p_idfint, 'id,idfint', v_ok_ctc,p_fecha,p_turno);
	            IF v_ok_ctc < 1 THEN 
	                ROLLBACK;
	                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error crítico: mxtuCtc ? mxCtc';
	            END IF;

	            CALL PasarTablaFDT('mxtuIte', 'mxIte', p_idfint, 'id,idfint', v_ok_ite,p_fecha,p_turno);
	            IF v_ok_ite < 1 THEN 
	                ROLLBACK;
	                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error crítico: mxtuIte ? mxIte';
	            END IF;

	            -- Tablas no críticas
	            CALL PasarTablaFDT('mxtuMvs', 'mxMvs', p_idfint, 'id,idfint', v_ok_otros,p_fecha,p_turno);
	            IF v_ok_otros < 1 THEN 
	                ROLLBACK;
	                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error crítico: mxtumvs ? mxmvs';
	            END IF;

	            CALL PasarTablaFDT('mxtuCaj', 'mxCaj', p_idfint, 'id,idfint', v_ok_otros,p_fecha,p_turno);
	            IF v_ok_otros < 1 THEN 
	                ROLLBACK;
	                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error crítico: mxtuCaj ? mxCaj';
	            END IF;

	            CALL PasarTablaFDT('mxtuAud', 'mxAud', p_idfint, 'id,idfint', v_ok_otros,p_fecha,p_turno);
	            IF v_ok_otros < 1 THEN 
	                ROLLBACK;
	                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error crítico: mxtuAud ? mxAud';
	            END IF;

	            CALL PasarTablaFDT('mxtuCtr', 'mxCtr', p_idfint, 'id,idfint', v_ok_otros,p_fecha,p_turno);
	            IF v_ok_otros < 1 THEN 
	                ROLLBACK;
	                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error crítico: mxtuCtr ? mxCtr';
	            END IF;

	            CALL PasarTablaFDT('mxtuSta', 'mxSta', p_idfint, 'id,idfint', v_ok_otros,p_fecha,p_turno);
	            IF v_ok_otros < 1 THEN 
	                ROLLBACK;
	                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error crítico: mxtuSta ? mxSta';
	            END IF;

	            CALL PasarTablaFDT('mxtuCm2', 'mxCm2', p_idfint, 'id,idfint', v_ok_otros,p_fecha,p_turno);
	            IF v_ok_otros < 1 THEN 
	                ROLLBACK;
	                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error crítico: mxtuCm2 ? mxCm2';
	            END IF;

	            CALL PasarTablaFDT('mxtuIpa', 'mxIpa', p_idfint, 'id,idfint', v_ok_otros,p_fecha,p_turno);
	            IF v_ok_otros < 1 THEN 
	                ROLLBACK;
	                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error crítico: mxtuIpa ? mxIpa';
	            END IF;

	            COMMIT;
	        END//
DELIMITER ;

-- Volcando estructura para función mx_52592.SigLunes
DELIMITER //
CREATE FUNCTION `SigLunes`(`Fec` DATE) RETURNS int(6)
BEGIN
				DECLARE Fec2 DATE;
				DECLARE SumarDias INT DEFAULT 0;
				DECLARE Comp INT(2) DEFAULT 0;
				DECLARE Retorno INT(6);
				set Fec2 = adddate(ADDDATE(Fec, INTERVAL - DAYOFWEEK(Fec) DAY), INTERVAL 9 DAY);
				SET Comp = truncate(((DAY(Fec2) - 1) / 7) + 1, 0);
				CASE Comp
					WHEN  1 THEN set SumarDias = 14;
					WHEN  2 THEN set SumarDias = 7;
					WHEN  4 THEN set SumarDias = -7;
					WHEN  5 THEN set SumarDias = -14;
					ELSE 
					BEGIN
						SET SumarDias = 0;
					END;
				END CASE;
				SET Retorno = abs((datediff(Fec, Fec2))) + SumarDias;
				RETURN Retorno;
			END//
DELIMITER ;

-- Volcando estructura para función mx_52592.SSiglo
DELIMITER //
CREATE FUNCTION `SSiglo`(`FecConSig` DATE) RETURNS char(8) CHARSET latin1
BEGIN
				DECLARE Retorno CHAR(8);
				Set Retorno = CONCAT(LPAD(DAY(FecConSig),2,0) , '/' , LPAD(MONTH(FecConSig),2,0), '/' , RIGHT(YEAR(FecConSig),2));
				RETURN Retorno;
			END//
DELIMITER ;

-- Volcando estructura para función mx_52592.TipoIVA
DELIMITER //
CREATE FUNCTION `TipoIVA`(`ttt` char(1),`abrev` int(1)) RETURNS char(18) CHARSET latin1
BEGIN
				DECLARE detalle  char(18);
				IF abrev = 0 THEN
					CASE ttt
						WHEN  '1' THEN set detalle = 'A Consumidor Final';
						WHEN  '2' THEN set detalle = 'Resp. Inscripto   ';
						WHEN  '3' THEN set detalle = 'Resp. No Inscripto';
						WHEN  '4' THEN set detalle = 'Resp. Monotributo ';
						WHEN  '5' THEN set detalle = 'No Responsable    ';
						WHEN  '6' THEN set detalle = 'Exento            ';
						ELSE
							BEGIN
								set detalle = 'Desconocido            ';
							END;
					END CASE;
				ELSE
					CASE ttt
						WHEN  '1' THEN set detalle = 'ACF';
						WHEN  '2' THEN set detalle = 'RI ';
						WHEN  '3' THEN set detalle = 'RNI';
						WHEN  '4' THEN set detalle = 'RM ';
						WHEN  '5' THEN set detalle = 'NR ';
						WHEN  '6' THEN set detalle = 'EXE';
						ELSE 
							BEGIN
								set detalle = '???';
							END;
					END CASE;
				END IF;
				RETURN detalle;
			END//
DELIMITER ;

-- Volcando estructura para disparador mx_52592.MXADI_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXADI_delete` AFTER DELETE
    ON MXADI FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXADI"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXADI",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXADI";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXADI_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXADI_insert` AFTER INSERT
    ON MXADI FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXADI"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXADI",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXADI";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXADI_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXADI_update` AFTER UPDATE
    ON MXADI FOR EACH ROW
BEGIN
     set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXADI"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXADI",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXADI";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXAPE_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXAPE_delete` AFTER DELETE
    ON MXAPE FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXAPE"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXAPE",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXAPE";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXAPE_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXAPE_insert` AFTER INSERT
    ON MXAPE FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXAPE"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXAPE",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXAPE";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXAPE_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXAPE_update` AFTER UPDATE
    ON MXAPE FOR EACH ROW
BEGIN
     set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXAPE"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXAPE",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXAPE";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXART_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXART_after_insert` AFTER INSERT
ON MXART FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXART"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXART",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXART";
    end if;
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_articulo"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_articulo",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_articulo" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXART_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXART_after_update` AFTER UPDATE
ON MXART FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXART"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXART",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXART";
    end if;
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_articulo"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_articulo",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_articulo" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxart_before_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxart_before_insert` BEFORE INSERT ON `mxart` FOR EACH ROW BEGIN	
	set NEW.fecha_update = now();
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxart_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxart_before_update` BEFORE UPDATE ON `mxart` FOR EACH ROW BEGIN	
	set NEW.fecha_update = now();
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxaud_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxaud_after_delete` AFTER DELETE ON `mxaud` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('AUD',	 								
	 							 CONCAT(DATE_FORMAT(old.fecha,'%Y%m%d'),",",TRIM(old.cod_suc),",",TRIM(old.turno),","
	 							 	,TRIM(old.cod_ctv),",",TRIM(old.mesa),",",TRIM(old.cod_cpb),",",
	 							 	TRIM(old.prefijo),",",TRIM(old.cod_emp),",",TRIM(old.hora_ape))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxaud_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxaud_before_update` BEFORE UPDATE ON `mxaud` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxcaj_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxcaj_after_delete` AFTER DELETE ON `mxcaj` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('CAJ',
	 							 CONCAT(DATE_FORMAT(old.fecha,'%Y%m%d'),TRIM(old.turno),","
								       ,TRIM(old.numero),","
										 ,TRIM(old.cod_suc),","
										 ,TRIM(old.tipo),","
										 ,old.referencia)
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxcaj_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxcaj_before_update` BEFORE UPDATE ON `mxcaj` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCAL_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCAL_after_insert` AFTER INSERT
    ON MXCAL FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_cliente"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_cliente",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_cliente" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCAL_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCAL_after_update` AFTER UPDATE
    ON MXCAL FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_cliente"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_cliente",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_cliente" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCAT_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCAT_after_insert` AFTER INSERT
    ON MXCAT FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_empleado"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_empleado",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_empleado" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCAT_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCAT_after_update` AFTER UPDATE
    ON MXCAT FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_empleado"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_empleado",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_empleado" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCGA_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCGA_after_insert` AFTER INSERT
    ON MXCGA FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_caja"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_caja",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_caja" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCGA_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCGA_after_update` AFTER UPDATE
    ON MXCGA FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_caja"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_caja",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_caja" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxcjm_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxcjm_after_delete` AFTER DELETE ON `mxcjm` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('CJM',
	 							 CONCAT(DATE_FORMAT(old.fecha,'%Y%m%d'),",",TRIM(old.numero),",",TRIM(old.cod_suc),",",TRIM(old.tipo),",",TRIM(old.referencia))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxcjm_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxcjm_before_update` BEFORE UPDATE ON `mxcjm` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCLI_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCLI_after_insert` AFTER INSERT
    ON MXCLI FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_cliente"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_cliente",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_cliente" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCLI_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCLI_after_update` AFTER UPDATE
    ON MXCLI FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_cliente"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_cliente",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_cliente" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCMO_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCMO_after_insert` AFTER INSERT
    ON MXCMO FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_stock"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_stock",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_stock" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCMO_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCMO_after_update` AFTER UPDATE
    ON MXCMO FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_stock"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_stock",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_stock" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCPB_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCPB_after_insert` AFTER INSERT
    ON MXCPB FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCPB_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCPB_after_update` AFTER UPDATE
    ON MXCPB FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxctc_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxctc_after_delete` AFTER DELETE ON `mxctc` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('CTC',	 								
	 							 CONCAT(TRIM(old.cod_suc),",",TRIM(old.prefijo),",",TRIM(old.numero),",",TRIM(old.cod_cpb))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxctc_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxctc_before_update` BEFORE UPDATE ON `mxctc` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxctr_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxctr_after_delete` AFTER DELETE ON `mxctr` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('CTR',	 								
	 							 CONCAT(TRIM(old.cod_cpb),",",TRIM(old.prefijo),",",TRIM(old.numero),",",TRIM(old.cod_suc))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxctr_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxctr_before_update` BEFORE UPDATE ON `mxctr` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCTV_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCTV_after_insert` AFTER INSERT
    ON MXCTV FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXCTV_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXCTV_after_update` AFTER UPDATE
    ON MXCTV FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXDATO_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXDATO_insert` AFTER INSERT
    ON MXDATO FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXDATO"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXDATO",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXDATO";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXDATO_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXDATO_update` AFTER UPDATE
    ON MXDATO FOR EACH ROW
BEGIN
     set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXDATO"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXDATO",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXDATO";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXDTO_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXDTO_after_insert` AFTER INSERT
    ON MXDTO FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXDTO_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXDTO_after_update` AFTER UPDATE
    ON MXDTO FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXEMP_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXEMP_after_insert` AFTER INSERT
    ON MXEMP FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_empleado"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_empleado",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_empleado" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXEMP_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXEMP_after_update` AFTER UPDATE
    ON MXEMP FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_empleado"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_empleado",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_empleado" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxfac_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxfac_after_delete` AFTER DELETE ON `mxfac` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('FAC',	 								
	 							CONCAT(TRIM(old.cod_suc),",",TRIM(old.numero),",",TRIM(old.prefijo),",",TRIM(old.cod_cpb))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxfac_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxfac_before_update` BEFORE UPDATE ON `mxfac` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXFOR_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXFOR_after_insert` AFTER INSERT
    ON MXFOR FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXFOR_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXFOR_after_update` AFTER UPDATE
    ON MXFOR FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxgas_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxgas_after_delete` AFTER DELETE ON `mxgas` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('GAS',	 								
	 							 CONCAT(TRIM(old.cod_pro),",",TRIM(old.cod_suc),",",TRIM(old.cod_cpb),",",TRIM(old.numero1),",",TRIM(old.numero2))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxgas_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxgas_before_update` BEFORE UPDATE ON `mxgas` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXGRA_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXGRA_after_insert` AFTER INSERT
    ON MXGRA FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_articulo"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_articulo",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_articulo" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXGRA_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXGRA_after_update` AFTER UPDATE
    ON MXGRA FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_articulo"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_articulo",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_articulo" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxhor_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxhor_after_delete` AFTER DELETE ON `mxhor` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('HOR',
	 							 CONCAT(TRIM(old.cod_emp),",",DATE_FORMAT(old.fecha,'%Y%m%d'),",",TRIM(old.cod_suc))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxhor_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxhor_before_update` BEFORE UPDATE ON `mxhor` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXINS_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXINS_after_insert` AFTER INSERT
    ON MXINS FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_stock"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_stock",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_stock" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxins_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxins_after_update` AFTER UPDATE
    ON MXINS FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_stock"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_stock",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_stock" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxins_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxins_before_update` BEFORE UPDATE ON `mxins` FOR EACH ROW BEGIN	
	IF NEW.precio!=OLD.precio then BEGIN 
		INSERT INTO mxinspre (cod_ins,fecha,precio) VALUES (NEW.codigo,NOW(),NEW.precio);
	END; END if; 
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxinv_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxinv_after_delete` AFTER DELETE ON `mxinv` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('INV',
	 							 CONCAT(DATE_FORMAT(old.fecha,'%Y%m%d'),",",TRIM(old.turno),",",TRIM(old.cod_suc),",",TRIM(old.cod_dep),",",TRIM(old.cod_ins))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxinv_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxinv_before_update` BEFORE UPDATE ON `mxinv` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxitc_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxitc_after_delete` AFTER DELETE ON `mxitc` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('ITC',	 								
	 							 CONCAT(TRIM(old.cod_suc),",",TRIM(old.cod_pro),",",TRIM(old.numero1),",",TRIM(old.numero2),",",TRIM(old.cod_cpb))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxitc_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxitc_before_update` BEFORE UPDATE ON `mxitc` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxite_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxite_after_delete` AFTER DELETE ON `mxite` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('ITE',	 								
	 							 CONCAT(TRIM(old.cod_suc),",",TRIM(old.numero),",",
	 							 		TRIM(old.cod_cpb),",",TRIM(old.prefijo),",",
	 							 		TRIM(old.padre),",",TRIM(old.hijo),",",
	 							 		TRIM(old.cod_art))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxite_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxite_before_update` BEFORE UPDATE ON `mxcaj` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXMES_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXMES_after_insert` AFTER INSERT
    ON MXMES FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXMES_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXMES_after_update` AFTER UPDATE
    ON MXMES FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXMON_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXMON_after_insert` AFTER INSERT
    ON MXMON FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXMON_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXMON_after_update` AFTER UPDATE
    ON MXMON FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxmov_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxmov_after_delete` AFTER DELETE ON `mxmov` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('MOV',	 								
	 							 CONCAT(DATE_FORMAT(old.fecha,'%Y%m%d'),",",TRIM(old.cod_ban),",",TRIM(old.cod_cba),",",TRIM(old.numero),",",TRIM(old.cod_suc))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxmov_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxmov_before_update` BEFORE UPDATE ON `mxmov` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxmvs_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxmvs_after_delete` AFTER DELETE ON `mxmvs` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('MVS',
	 							 CONCAT(TRIM(old.cod_suc),",",TRIM(old.prefijo),",",TRIM(old.remito),",",TRIM(old.artins))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxmvs_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxmvs_before_update` BEFORE UPDATE ON `mxmvs` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxmvsan_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxmvsan_after_delete` AFTER DELETE ON `mxmvsan` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('MVSAN',
	 							 CONCAT(trim(old.prefijo),",",TRIM(old.remito),",",TRIM(old.artins),",",TRIM(old.cod_suc))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxmvsan_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxmvsan_before_update` BEFORE UPDATE ON `mxmvsan` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxmvsobs_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxmvsobs_after_delete` AFTER DELETE ON `mxmvsobs` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('MVSOBS',	 								
	 							 CONCAT(TRIM(old.remito),",",TRIM(old.cod_suc))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxmvsobs_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxmvsobs_before_update` BEFORE UPDATE ON `mxmvsobs` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxord_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxord_after_delete` AFTER DELETE ON `mxord` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('ORD',
	 							 CONCAT(TRIM(old.cod_pro),",",TRIM(old.numero),",",TRIM(old.cod_ins),",",TRIM(old.unidad_med),",",TRIM(old.cod_suc))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxord_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxord_before_update` BEFORE UPDATE ON `mxord` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXPAE_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXPAE_after_insert` AFTER INSERT
    ON MXPAE FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXPAE_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXPAE_after_update` AFTER UPDATE
    ON MXPAE FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_venta"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_venta",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_venta" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxpag_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxpag_after_delete` AFTER DELETE ON `mxpag` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('PAG',	 								
	 							 CONCAT(TRIM(old.cod_pro),",",TRIM(old.cod_suc),",",TRIM(old.cod_cpb),
	 							 	   ",",TRIM(old.numero1),",",TRIM(old.numero2),",",TRIM(old.tipo),",",old.referencia)
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxpag_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxpag_before_update` BEFORE UPDATE ON `mxpag` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXPRM_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXPRM_after_delete` AFTER DELETE
    ON MXPRM FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_articulo"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_articulo",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_articulo" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXPRM_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXPRM_after_insert` AFTER INSERT
    ON MXPRM FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXPRM"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXPRM",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXPRM";
    end if;
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_articulo"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_articulo",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_articulo" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxprm_before_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxprm_before_insert` BEFORE INSERT ON `mxprm` FOR EACH ROW BEGIN	
	set NEW.fecha_update = now();
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxprm_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxprm_before_update` BEFORE UPDATE ON `mxprm` FOR EACH ROW BEGIN	
	set NEW.fecha_update = now();
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXPRO_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXPRO_after_insert` AFTER INSERT
    ON MXPRO FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_stock"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_stock",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_stock" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXPRO_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXPRO_after_update` AFTER UPDATE
    ON MXPRO FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_stock"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_stock",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_stock" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXREC_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXREC_after_delete` AFTER DELETE
    ON MXREC FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_stock"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_stock",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_stock" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXREC_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXREC_after_insert` AFTER INSERT
    ON MXREC FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_stock"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_stock",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_stock" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXRES_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXRES_insert` AFTER INSERT
    ON MXRES FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXRES"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXRES",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXRES";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXRES_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXRES_update` AFTER UPDATE
    ON MXRES FOR EACH ROW
BEGIN
     set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXRES"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXRES",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXRES";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXRGA_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXRGA_after_insert` AFTER INSERT
    ON MXRGA FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_caja"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_caja",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_caja" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXRGA_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXRGA_after_update` AFTER UPDATE
    ON MXRGA FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_caja"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_caja",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_caja" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXRUA_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXRUA_after_insert` AFTER INSERT
    ON MXRUA FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXRUA"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXRUA",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXRUA";
    end if;
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_articulo"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_articulo",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_articulo" ;
    end if;     
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXRUA_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXRUA_after_update` AFTER UPDATE
    ON MXRUA FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXRUA"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXART",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXRUA";
    end if;
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_articulo"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_articulo",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_articulo" ;
    end if; 
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxrua_before_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxrua_before_insert` BEFORE INSERT ON `mxrua` FOR EACH ROW BEGIN	
	set NEW.fecha_update = now();
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxrua_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxrua_before_update` BEFORE UPDATE ON `mxrua` FOR EACH ROW BEGIN	
	set NEW.fecha_update = now();
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXRUI_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXRUI_after_insert` AFTER INSERT
    ON MXRUI FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_stock"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_stock",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_stock" ;
    end if;  
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXRUI_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXRUI_after_update` AFTER UPDATE
    ON MXRUI FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_stock"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_stock",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_stock" ;
    end if;  
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXSEC_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXSEC_after_insert` AFTER INSERT
    ON MXSEC FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_cliente"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_cliente",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_cliente" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXSEC_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXSEC_after_update` AFTER UPDATE
    ON MXSEC FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_cliente"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_cliente",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_cliente" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxsta_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxsta_after_delete` AFTER DELETE ON `mxsta` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('STA',	 								
	 							 CONCAT(TRIM(old.cod_suc),",",TRIM(old.numero),",",TRIM(old.prefijo),",",TRIM(old.cod_cpb),",",TRIM(old.cod_art),",",TRIM(old.cod_ins))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxsta_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxsta_before_update` BEFORE UPDATE ON `mxsta` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXSUA_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXSUA_after_insert` AFTER INSERT
    ON MXSUA FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXSUA"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXSUA",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXSUA";
    end if;
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_articulo"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_articulo",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_articulo" ;
    end if;  
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXSUA_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXSUA_after_update` AFTER UPDATE
    ON MXSUA FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXSUA"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXSUA",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXSUA";
    end if;
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_articulo"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_articulo",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_articulo" ;
    end if;  
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxsua_before_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxsua_before_insert` BEFORE INSERT ON `mxsua` FOR EACH ROW BEGIN	
	set NEW.fecha_update = now();
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxsua_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxsua_before_update` BEFORE UPDATE ON `mxsua` FOR EACH ROW BEGIN	
	set NEW.fecha_update = now();
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXTER_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXTER_after_insert` AFTER INSERT
    ON MXTER FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_vario"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_vario",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_vario" ;
    end if;    
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXTER_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXTER_after_update` AFTER UPDATE
    ON MXTER FOR EACH ROW
BEGIN
    set @x= (select count(id) * 1. as cont from mxbigg where coleccion = "maestros_vario"); 
    if @x = 0 then
		insert into mxbigg  (coleccion, fecha, procesado, reproceso, date_create) values ("maestros_vario",  CURDATE(), 0, 0,NOW());
    else
		update mxbigg  set procesado = 0,fecha = curdate(),date_create = NOW() where coleccion = "maestros_vario" ;
    end if;      
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXTUPAPE_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXTUPAPE_insert` AFTER INSERT
    ON MXTUPAPE FOR EACH ROW
BEGIN
   set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXTUPAPE"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXTUPAPE",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXTUPAPE";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.MXTUPAPE_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `MXTUPAPE_update` AFTER UPDATE
    ON MXTUPAPE FOR EACH ROW
BEGIN
     set @y = (select count(id) * 1. as cont from mxtablalog where tabla = "MXTUPAPE"); 
    if @y = 0 then
      insert into mxtablalog (tabla, checksum) values ("MXTUPAPE",  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')));
    else
      update mxtablalog set checksum =  md5(DATE_FORMAT(concat(curdate(), ' ', curtime(4)), '%Y-%m-%d %H:%i:%s:%f')) where tabla = "MXTUPAPE";
    end if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxvec_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxvec_after_delete` AFTER DELETE ON `mxvec` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerdel_deshabilitado,0) = 0 THEN
		INSERT INTO mxlogdel (tabla,pk,fecha)
	 							VALUES('VEC',
	 							 CONCAT(TRIM(old.numero),",",TRIM(old.cod_suc),",",DATE_FORMAT(old.fecha,'%Y%m%d'),",",TRIM(old.banco),",",TRIM(old.cod_cli))
								 ,now());
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxvec_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxvec_before_update` BEFORE UPDATE ON `mxvec` FOR EACH ROW BEGIN	
	IF IFNULL(@s_triggerupd_deshabilitado,0) = 0 THEN
		SET new.envio = 0;
	END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador mx_52592.mxver_before_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `mxver_before_update` BEFORE UPDATE ON `mxver` FOR EACH ROW BEGIN	
	set NEW.fechacreacion = curdate();
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
