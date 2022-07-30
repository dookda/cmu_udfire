--
-- PostgreSQL database dump
--

-- Dumped from database version 11.12 (Ubuntu 11.12-1.pgdg16.04+1)
-- Dumped by pg_dump version 14.2

-- Started on 2022-05-30 12:14:18 +07

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

--
-- TOC entry 2 (class 3079 OID 675069)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 4154 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

--
-- TOC entry 203 (class 1259 OID 676110)
-- Name: cm_agriculture_zoning; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ndvi (
    gid integer NOT NULL,
    nadi numeric,
    fname character varying(100),
    dd date,
    geom public.geometry(POINT,4326)
);


ALTER TABLE public.cm_agriculture_zoning OWNER TO postgres;

--
-- TOC entry 202 (class 1259 OID 676108)
-- Name: cm_agriculture_zoning_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cm_agriculture_zoning_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cm_agriculture_zoning_gid_seq OWNER TO postgres;

--
-- TOC entry 4155 (class 0 OID 0)
-- Dependencies: 202
-- Name: cm_agriculture_zoning_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cm_agriculture_zoning_gid_seq OWNED BY public.cm_agriculture_zoning.gid;