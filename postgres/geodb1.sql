SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';
SET default_tablespace = '';



CREATE TABLE public.ndvi (
    gid serial NOT NULL,
    ndvi numeric,
    fname character varying(100),
    dd date,
    geom public.geometry(POINT,4326)
);
ALTER TABLE public.ndvi OWNER TO postgres;
CREATE SEQUENCE public.ndvi_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.ndvi_gid_seq OWNER TO postgres;
ALTER SEQUENCE public.ndvi_gid_seq OWNED BY public.ndvi.gid;


CREATE TABLE public.imglist (
    gid serial NOT NULL,
    doy character varying(100),
    dd date
);
ALTER TABLE public.imglist OWNER TO postgres;
CREATE SEQUENCE public.imglist_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.imglist_gid_seq OWNER TO postgres;
ALTER SEQUENCE public.imglist_gid_seq OWNED BY public.imglist.gid;