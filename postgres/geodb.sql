--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5 (Debian 14.5-2.pgdg110+2)
-- Dumped by pg_dump version 15.0

-- Started on 2022-10-24 23:18:30 +07

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
-- TOC entry 8 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 11 (class 2615 OID 19224)
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: postgres
--

--
-- TOC entry 10 (class 2615 OID 19050)
-- Name: topology; Type: SCHEMA; Schema: -; Owner: postgres
--

--
-- TOC entry 4 (class 3079 OID 19213)
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- TOC entry 4612 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- TOC entry 2 (class 3079 OID 18005)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 4613 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- TOC entry 5 (class 3079 OID 19225)
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- TOC entry 4614 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- TOC entry 3 (class 3079 OID 19051)
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- TOC entry 4615 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 281 (class 1259 OID 24577)
-- Name: imglist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.imglist (
    gid integer NOT NULL,
    doy text,
    dd text,
    yy text,
    dt date
);


ALTER TABLE public.imglist OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 24576)
-- Name: imglist_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.imglist_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.imglist_gid_seq OWNER TO postgres;

--
-- TOC entry 4616 (class 0 OID 0)
-- Dependencies: 280
-- Name: imglist_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.imglist_gid_seq OWNED BY public.imglist.gid;


--
-- TOC entry 279 (class 1259 OID 19625)
-- Name: ndvi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ndvi (
    gid integer NOT NULL,
    ndvi numeric,
    fname character varying(100),
    dd date,
    geom public.geometry(Point,4326)
);


ALTER TABLE public.ndvi OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 19624)
-- Name: ndvi_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ndvi_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ndvi_gid_seq OWNER TO postgres;

--
-- TOC entry 4617 (class 0 OID 0)
-- Dependencies: 278
-- Name: ndvi_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ndvi_gid_seq OWNED BY public.ndvi.gid;


--
-- TOC entry 4437 (class 2604 OID 24580)
-- Name: imglist gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imglist ALTER COLUMN gid SET DEFAULT nextval('public.imglist_gid_seq'::regclass);


--
-- TOC entry 4436 (class 2604 OID 19628)
-- Name: ndvi gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ndvi ALTER COLUMN gid SET DEFAULT nextval('public.ndvi_gid_seq'::regclass);


--
-- TOC entry 4604 (class 0 OID 24577)
-- Dependencies: 281
-- Data for Name: imglist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.imglist (gid, doy, dt) FROM stdin;
\.


--
-- TOC entry 4602 (class 0 OID 19625)
-- Dependencies: 279
-- Data for Name: ndvi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ndvi (gid, ndvi, fname, dd, geom) FROM stdin;
\.


--
-- TOC entry 4420 (class 0 OID 18317)
-- Dependencies: 217
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 4423 (class 0 OID 19231)
-- Dependencies: 228
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
\.


--
-- TOC entry 4424 (class 0 OID 19563)
-- Dependencies: 273
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- TOC entry 4425 (class 0 OID 19573)
-- Dependencies: 275
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- TOC entry 4426 (class 0 OID 19583)
-- Dependencies: 277
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
\.


--
-- TOC entry 4421 (class 0 OID 19053)
-- Dependencies: 222
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: postgres
--

COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
\.


--
-- TOC entry 4422 (class 0 OID 19065)
-- Dependencies: 223
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: postgres
--

COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
\.


--
-- TOC entry 4618 (class 0 OID 0)
-- Dependencies: 280
-- Name: imglist_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.imglist_gid_seq', 1, false);


--
-- TOC entry 4619 (class 0 OID 0)
-- Dependencies: 278
-- Name: ndvi_gid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ndvi_gid_seq', 1, false);


--
-- TOC entry 4610 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2022-10-24 23:18:30 +07

--
-- PostgreSQL database dump complete
--

