--
-- PostgreSQL database dump
--

-- Dumped from database version 11.3 (Ubuntu 11.3-1)
-- Dumped by pg_dump version 11.3 (Ubuntu 11.3-1)

-- Started on 2019-06-06 15:04:24 BST

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
-- TOC entry 3028 (class 1262 OID 16393)
-- Name: ihw_annotator; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE ihw_annotator WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_GB.UTF-8' LC_CTYPE = 'en_GB.UTF-8';


ALTER DATABASE ihw_annotator OWNER TO postgres;

\connect ihw_annotator

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

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 196 (class 1259 OID 16394)
-- Name: annotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.annotations (
    docid character varying NOT NULL,
    page integer NOT NULL,
    "user" character varying NOT NULL,
    annotation json,
    corrupted character varying,
    "tableType" character varying,
    corrupted_text character varying,
    "N" integer NOT NULL
);


ALTER TABLE public.annotations OWNER TO postgres;

--
-- TOC entry 197 (class 1259 OID 16400)
-- Name: annotations_N_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."annotations_N_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."annotations_N_seq" OWNER TO postgres;

--
-- TOC entry 3029 (class 0 OID 0)
-- Dependencies: 197
-- Name: annotations_N_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."annotations_N_seq" OWNED BY public.annotations."N";


--
-- TOC entry 198 (class 1259 OID 16411)
-- Name: clusters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clusters (
    cn integer,
    concept character varying NOT NULL,
    cuis character varying,
    isdefault boolean,
    cn_override integer
);


ALTER TABLE public.clusters OWNER TO postgres;

--
-- TOC entry 2897 (class 2604 OID 16402)
-- Name: annotations N; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annotations ALTER COLUMN "N" SET DEFAULT nextval('public."annotations_N_seq"'::regclass);


--
-- TOC entry 2901 (class 2606 OID 16418)
-- Name: clusters pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clusters
    ADD CONSTRAINT pkey PRIMARY KEY (concept);


--
-- TOC entry 2899 (class 2606 OID 16410)
-- Name: annotations primarykey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annotations
    ADD CONSTRAINT primarykey PRIMARY KEY (docid, page, "user");


-- Completed on 2019-06-06 15:04:24 BST

--
-- PostgreSQL database dump complete
--

