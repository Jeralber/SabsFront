
BEGIN;


CREATE TABLE IF NOT EXISTS public.area
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_39d5e4de490139d6535d75f42ff" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.area_centro
(
    id serial NOT NULL,
    "centroId" integer,
    "areaId" integer,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_b643bcb9ffbf84a87b2da97826b" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.categoria_material
(
    id serial NOT NULL,
    codigo character varying COLLATE pg_catalog."default" NOT NULL,
    categoria character varying COLLATE pg_catalog."default" NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_b5428d0f2ea69050e081857ba2e" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.centro
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    "municipioId" integer,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_dcccfc4ab1d927f06cbf46c67ab" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.detalles
(
    id serial NOT NULL,
    "cantidadSolicitada" integer NOT NULL,
    descripcion character varying COLLATE pg_catalog."default",
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    "materialId" integer,
    "personaEncargadaId" integer,
    "personaSolicitaId" integer,
    "personaApruebaId" integer,
    cantidad integer NOT NULL,
    "solicitudId" integer,
    CONSTRAINT "PK_927363ea5d0f59d6fe6c9d5bcd2" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.ficha
(
    id serial NOT NULL,
    numero integer NOT NULL,
    "cantidadAprendices" integer,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_00e85ebf7b3b91cebebcef6906c" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.material
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    descripcion character varying COLLATE pg_catalog."default" NOT NULL,
    stock integer NOT NULL,
    caduca boolean NOT NULL DEFAULT true,
    "fechaVencimiento" character varying COLLATE pg_catalog."default",
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    "tipoMaterialId" integer,
    "unidadMedidaId" integer,
    "categoriaMaterialId" integer,
    CONSTRAINT "PK_0343d0d577f3effc2054cbaca7f" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.modulo
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "PK_0b577bb28fdb8c35383e2c573ea" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.movimiento
(
    id serial NOT NULL,
    "tipoMovimientoId" integer,
    "personaId" integer,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    "materialId" integer NOT NULL,
    cantidad integer NOT NULL,
    CONSTRAINT "PK_809988d143ce94a95f3d30164ab" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.municipio
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_74346041a3332b7880d76c610f3" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.opcion
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    descripcion character varying COLLATE pg_catalog."default",
    "rutaFrontend" character varying COLLATE pg_catalog."default" NOT NULL,
    "moduloId" integer NOT NULL,
    CONSTRAINT "PK_00d3214b751c1e2442c0deda6f4" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.permiso
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    descripcion character varying COLLATE pg_catalog."default",
    codigo character varying COLLATE pg_catalog."default" NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    "opcionId" integer,
    CONSTRAINT "PK_8f675309c577bd8f4d826994e95" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.persona
(
    id serial NOT NULL,
    identificacion character varying COLLATE pg_catalog."default" NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    apellido character varying COLLATE pg_catalog."default" NOT NULL,
    telefono character varying COLLATE pg_catalog."default",
    correo character varying COLLATE pg_catalog."default" NOT NULL,
    contrasena character varying COLLATE pg_catalog."default" NOT NULL,
    edad integer NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    "rolId" integer,
    "fichaId" integer,
    CONSTRAINT "PK_13aefc75f60510f2be4cd243d71" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.rol
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_c93a22388638fac311781c7f2dd" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.rol_permiso_opcion
(
    id serial NOT NULL,
    "rolId" integer,
    "permisoId" integer,
    "opcionId" integer,
    CONSTRAINT "PK_d4082490ee8659e0607e42bbc85" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.sede
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    direccion character varying COLLATE pg_catalog."default" NOT NULL,
    "centroId" integer,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_7d4d2fa286af7315120c92eb3e0" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.sitio
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    "tipoSitioId" integer,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_09874265e068d0b50ed13519249" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.solicitud
(
    id serial NOT NULL,
    descripcion character varying COLLATE pg_catalog."default" NOT NULL,
    estado character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'PENDIENTE'::character varying,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone NOT NULL DEFAULT now(),
    "personaId" integer NOT NULL,
    "personaApruebaId" integer,
    "personaEncargadaId" integer,
    aprobada boolean,
    CONSTRAINT "PK_511b9da509891c4d75633b5079c" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.tipo_material
(
    id serial NOT NULL,
    tipo character varying COLLATE pg_catalog."default" NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_a05d91956d548fad6abc8684dd5" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.tipo_movimiento
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_9029b4ce24330535c285fbf70b1" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.tipo_sitio
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_a03e33661558af784b72176ca2e" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.titulado
(
    id serial NOT NULL,
    nombre character varying COLLATE pg_catalog."default" NOT NULL,
    "areaId" integer,
    "fichaId" integer,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_aca3e0fa78e5c96f4211a611299" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.unidad_medida
(
    id serial NOT NULL,
    unidad character varying COLLATE pg_catalog."default" NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    "fechaCreacion" timestamp without time zone NOT NULL DEFAULT now(),
    "fechaActualizacion" timestamp without time zone DEFAULT now(),
    CONSTRAINT "PK_a0dad78a29ef378d8339d6b3d69" PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.area_centro
    ADD CONSTRAINT "FK_9faabbd2637ee0666bc62e8ef82" FOREIGN KEY ("areaId")
    REFERENCES public.area (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.area_centro
    ADD CONSTRAINT "FK_d0717fd0260101ecdcf896e3a6a" FOREIGN KEY ("centroId")
    REFERENCES public.centro (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.centro
    ADD CONSTRAINT "FK_ffde2e865075948589831183847" FOREIGN KEY ("municipioId")
    REFERENCES public.municipio (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.detalles
    ADD CONSTRAINT "FK_0209de6427417513c668cb6f334" FOREIGN KEY ("materialId")
    REFERENCES public.material (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.detalles
    ADD CONSTRAINT "FK_366fbe53f1caa4516257b853982" FOREIGN KEY ("personaApruebaId")
    REFERENCES public.persona (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.detalles
    ADD CONSTRAINT "FK_b7ff7517ebbbd616e2f08b81dd8" FOREIGN KEY ("solicitudId")
    REFERENCES public.solicitud (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.detalles
    ADD CONSTRAINT "FK_c7a3871988baa5d3b26f7fbe8fd" FOREIGN KEY ("personaSolicitaId")
    REFERENCES public.persona (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.detalles
    ADD CONSTRAINT "FK_cede38ce538ebdd23b0de853acf" FOREIGN KEY ("personaEncargadaId")
    REFERENCES public.persona (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.material
    ADD CONSTRAINT "FK_52f6255a12db6b451d7d5c470f6" FOREIGN KEY ("unidadMedidaId")
    REFERENCES public.unidad_medida (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.material
    ADD CONSTRAINT "FK_a86b2e64afc1c62d1350b41d181" FOREIGN KEY ("tipoMaterialId")
    REFERENCES public.tipo_material (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.material
    ADD CONSTRAINT "FK_b3d228978a394f031dbc48c4858" FOREIGN KEY ("categoriaMaterialId")
    REFERENCES public.categoria_material (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.movimiento
    ADD CONSTRAINT "FK_3f279ab82d96e2bd01c14e7dc35" FOREIGN KEY ("materialId")
    REFERENCES public.material (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.movimiento
    ADD CONSTRAINT "FK_97c8af1283e23cd8d9691ebd151" FOREIGN KEY ("personaId")
    REFERENCES public.persona (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.movimiento
    ADD CONSTRAINT "FK_a041e837265410ea7f04ad05333" FOREIGN KEY ("tipoMovimientoId")
    REFERENCES public.tipo_movimiento (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.opcion
    ADD CONSTRAINT "FK_d2b6ef71611cf91006f7b5ea88a" FOREIGN KEY ("moduloId")
    REFERENCES public.modulo (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.permiso
    ADD CONSTRAINT "FK_d5f7e229d4a0d6745faecaf8f3f" FOREIGN KEY ("opcionId")
    REFERENCES public.opcion (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.persona
    ADD CONSTRAINT "FK_35e654a9e7869d2169861f58a68" FOREIGN KEY ("rolId")
    REFERENCES public.rol (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.persona
    ADD CONSTRAINT "FK_b735b5dee6fd7b2f576ee3be57f" FOREIGN KEY ("fichaId")
    REFERENCES public.ficha (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.rol_permiso_opcion
    ADD CONSTRAINT "FK_0a6144a222a5d4546343aa92fed" FOREIGN KEY ("permisoId")
    REFERENCES public.permiso (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.rol_permiso_opcion
    ADD CONSTRAINT "FK_95db75f15fea7a79606c85f1fe9" FOREIGN KEY ("rolId")
    REFERENCES public.rol (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.rol_permiso_opcion
    ADD CONSTRAINT "FK_efd02b64dca42179b0e5fb5b018" FOREIGN KEY ("opcionId")
    REFERENCES public.opcion (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.sede
    ADD CONSTRAINT "FK_bc6d041b3e5cfadf001e94904c0" FOREIGN KEY ("centroId")
    REFERENCES public.centro (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.sitio
    ADD CONSTRAINT "FK_d3014cf6a2d3817f91a6253d879" FOREIGN KEY ("tipoSitioId")
    REFERENCES public.tipo_sitio (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.solicitud
    ADD CONSTRAINT "FK_3b9c019a3ee301b41b50f62b0c0" FOREIGN KEY ("personaId")
    REFERENCES public.persona (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.titulado
    ADD CONSTRAINT "FK_53642decdbffa32496fbc52ae3b" FOREIGN KEY ("areaId")
    REFERENCES public.area (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.titulado
    ADD CONSTRAINT "FK_6ab0a5c2b05d7ddfc6b8a4357a6" FOREIGN KEY ("fichaId")
    REFERENCES public.ficha (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;