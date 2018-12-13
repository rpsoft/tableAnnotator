--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.7
-- Dumped by pg_dump version 10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)

-- Started on 2018-12-13 17:04:26 GMT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 12393)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2143 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 181 (class 1259 OID 16547)
-- Name: annotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.annotations (
    docid character varying,
    page integer,
    "user" character varying,
    annotation json,
    corrupted character varying,
    "tableType" character varying,
    "N" integer NOT NULL
);


ALTER TABLE public.annotations OWNER TO postgres;

--
-- TOC entry 182 (class 1259 OID 16553)
-- Name: annotations_N_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."annotations_N_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."annotations_N_seq" OWNER TO postgres;

--
-- TOC entry 2144 (class 0 OID 0)
-- Dependencies: 182
-- Name: annotations_N_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."annotations_N_seq" OWNED BY public.annotations."N";


--
-- TOC entry 2018 (class 2604 OID 16555)
-- Name: annotations N; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annotations ALTER COLUMN "N" SET DEFAULT nextval('public."annotations_N_seq"'::regclass);


--
-- TOC entry 2133 (class 0 OID 16547)
-- Dependencies: 181
-- Data for Name: annotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.annotations (docid, page, "user", annotation, corrupted, "tableType", "N") FROM stdin;
\.


--
-- TOC entry 2145 (class 0 OID 0)
-- Dependencies: 182
-- Name: annotations_N_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."annotations_N_seq"', 31, true);


--
-- TOC entry 2142 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2018-12-13 17:04:26 GMT

--
-- PostgreSQL database dump complete
--

