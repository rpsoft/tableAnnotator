PGDMP                         v            ihw_annotator    9.5.7 #   10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)     Y           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                       false            Z           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                       false            [           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                       false            \           1262    16546    ihw_annotator    DATABASE        CREATE DATABASE ihw_annotator WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_GB.UTF-8' LC_CTYPE = 'en_GB.UTF-8';
    DROP DATABASE ihw_annotator;
             postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
             postgres    false            ]           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                  postgres    false    7            ^           0    0    SCHEMA public    ACL     �   REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;
                  postgres    false    7                        3079    12393    plpgsql 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
    DROP EXTENSION plpgsql;
                  false            _           0    0    EXTENSION plpgsql    COMMENT     @   COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';
                       false    1            �            1259    16547    annotations    TABLE     �   CREATE TABLE public.annotations (
    docid character varying,
    page integer,
    "user" character varying,
    annotation json,
    corrupted character varying,
    "tableType" character varying,
    "N" integer NOT NULL
);
    DROP TABLE public.annotations;
       public         postgres    false    7            �            1259    16553    annotations_N_seq    SEQUENCE     |   CREATE SEQUENCE public."annotations_N_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public."annotations_N_seq";
       public       postgres    false    181    7            `           0    0    annotations_N_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public."annotations_N_seq" OWNED BY public.annotations."N";
            public       postgres    false    182            �           2604    16555    annotations N    DEFAULT     r   ALTER TABLE ONLY public.annotations ALTER COLUMN "N" SET DEFAULT nextval('public."annotations_N_seq"'::regclass);
 >   ALTER TABLE public.annotations ALTER COLUMN "N" DROP DEFAULT;
       public       postgres    false    182    181            U          0    16547    annotations 
   TABLE DATA               c   COPY public.annotations (docid, page, "user", annotation, corrupted, "tableType", "N") FROM stdin;
    public       postgres    false    181   �       a           0    0    annotations_N_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public."annotations_N_seq"', 31, true);
            public       postgres    false    182            U      x������ � �     