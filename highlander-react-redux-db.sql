--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.1
-- Dumped by pg_dump version 9.6.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: coaches; Type: TABLE; Schema: public; Owner: vampaynani
--

CREATE TABLE coaches (
    id integer NOT NULL,
    email character varying(255),
    password character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE coaches OWNER TO vampaynani;

--
-- Name: coaches_id_seq; Type: SEQUENCE; Schema: public; Owner: vampaynani
--

CREATE SEQUENCE coaches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE coaches_id_seq OWNER TO vampaynani;

--
-- Name: coaches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vampaynani
--

ALTER SEQUENCE coaches_id_seq OWNED BY coaches.id;


--
-- Name: coaches_teams; Type: TABLE; Schema: public; Owner: vampaynani
--

CREATE TABLE coaches_teams (
    coach_id integer,
    team_id integer
);


ALTER TABLE coaches_teams OWNER TO vampaynani;

--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: vampaynani
--

CREATE TABLE knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE knex_migrations OWNER TO vampaynani;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: vampaynani
--

CREATE SEQUENCE knex_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE knex_migrations_id_seq OWNER TO vampaynani;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vampaynani
--

ALTER SEQUENCE knex_migrations_id_seq OWNED BY knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: vampaynani
--

CREATE TABLE knex_migrations_lock (
    is_locked integer
);


ALTER TABLE knex_migrations_lock OWNER TO vampaynani;

--
-- Name: players; Type: TABLE; Schema: public; Owner: vampaynani
--

CREATE TABLE players (
    id integer NOT NULL,
    email character varying(255),
    password character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    "position" character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE players OWNER TO vampaynani;

--
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: vampaynani
--

CREATE SEQUENCE players_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE players_id_seq OWNER TO vampaynani;

--
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vampaynani
--

ALTER SEQUENCE players_id_seq OWNED BY players.id;


--
-- Name: players_stat_catalogs; Type: TABLE; Schema: public; Owner: vampaynani
--

CREATE TABLE players_stat_catalogs (
    id integer NOT NULL,
    player_id integer,
    stat_catalog_id integer,
    how_many integer,
    game_date timestamp with time zone
);


ALTER TABLE players_stat_catalogs OWNER TO vampaynani;

--
-- Name: players_stat_catalogs_id_seq; Type: SEQUENCE; Schema: public; Owner: vampaynani
--

CREATE SEQUENCE players_stat_catalogs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE players_stat_catalogs_id_seq OWNER TO vampaynani;

--
-- Name: players_stat_catalogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vampaynani
--

ALTER SEQUENCE players_stat_catalogs_id_seq OWNED BY players_stat_catalogs.id;


--
-- Name: players_teams; Type: TABLE; Schema: public; Owner: vampaynani
--

CREATE TABLE players_teams (
    team_id integer,
    player_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE players_teams OWNER TO vampaynani;

--
-- Name: stat_catalogs; Type: TABLE; Schema: public; Owner: vampaynani
--

CREATE TABLE stat_catalogs (
    id integer NOT NULL,
    description character varying(255)
);


ALTER TABLE stat_catalogs OWNER TO vampaynani;

--
-- Name: stat_catalogs_id_seq; Type: SEQUENCE; Schema: public; Owner: vampaynani
--

CREATE SEQUENCE stat_catalogs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE stat_catalogs_id_seq OWNER TO vampaynani;

--
-- Name: stat_catalogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vampaynani
--

ALTER SEQUENCE stat_catalogs_id_seq OWNED BY stat_catalogs.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: vampaynani
--

CREATE TABLE teams (
    id integer NOT NULL,
    name character varying(255),
    city character varying(255),
    state character varying(255),
    game_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE teams OWNER TO vampaynani;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: vampaynani
--

CREATE SEQUENCE teams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE teams_id_seq OWNER TO vampaynani;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vampaynani
--

ALTER SEQUENCE teams_id_seq OWNED BY teams.id;


--
-- Name: coaches id; Type: DEFAULT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY coaches ALTER COLUMN id SET DEFAULT nextval('coaches_id_seq'::regclass);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY knex_migrations ALTER COLUMN id SET DEFAULT nextval('knex_migrations_id_seq'::regclass);


--
-- Name: players id; Type: DEFAULT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY players ALTER COLUMN id SET DEFAULT nextval('players_id_seq'::regclass);


--
-- Name: players_stat_catalogs id; Type: DEFAULT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY players_stat_catalogs ALTER COLUMN id SET DEFAULT nextval('players_stat_catalogs_id_seq'::regclass);


--
-- Name: stat_catalogs id; Type: DEFAULT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY stat_catalogs ALTER COLUMN id SET DEFAULT nextval('stat_catalogs_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY teams ALTER COLUMN id SET DEFAULT nextval('teams_id_seq'::regclass);


--
-- Data for Name: coaches; Type: TABLE DATA; Schema: public; Owner: vampaynani
--

COPY coaches (id, email, password, first_name, last_name, created_at, updated_at) FROM stdin;
1	romanh99@gmail.com	highlander	Isaac	Brewman	2017-07-18 14:41:08.514891-05	2017-07-18 14:41:08.514891-05
2	romanh99@gmail.com	highlander	Danny	Diaz	2017-07-18 14:41:08.514891-05	2017-07-18 14:41:08.514891-05
\.


--
-- Name: coaches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vampaynani
--

SELECT pg_catalog.setval('coaches_id_seq', 2, true);


--
-- Data for Name: coaches_teams; Type: TABLE DATA; Schema: public; Owner: vampaynani
--

COPY coaches_teams (coach_id, team_id) FROM stdin;
1	3
1	2
2	4
2	1
\.


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: vampaynani
--

COPY knex_migrations (id, name, batch, migration_time) FROM stdin;
1	20170301023010_create_coaches.js	1	2017-07-18 14:40:44.128-05
2	20170301023012_create_players.js	1	2017-07-18 14:40:44.151-05
3	20170301023019_create_teams.js	1	2017-07-18 14:40:44.17-05
4	20170302152435_create_team_associations.js	1	2017-07-18 14:40:44.223-05
5	20170302155108_create_stat_catalogs.js	1	2017-07-18 14:40:44.247-05
6	20170302155817_create_stats.js	1	2017-07-18 14:40:44.279-05
7	20170313210158_create_coach_association.js	1	2017-07-18 14:40:44.308-05
\.


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vampaynani
--

SELECT pg_catalog.setval('knex_migrations_id_seq', 7, true);


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: vampaynani
--

COPY knex_migrations_lock (is_locked) FROM stdin;
0
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: vampaynani
--

COPY players (id, email, password, first_name, last_name, "position", created_at, updated_at) FROM stdin;
1	romanh99@gmail.com	highlander	Heriberto	Roman	1st base	2017-07-18 14:41:08.530408-05	2017-07-18 14:41:08.530408-05
2	brown@gmail.com	highlander	Randy	Brown	2nd base	2017-07-18 14:41:08.530408-05	2017-07-18 14:41:08.530408-05
3	bigmac@gmail.com	highlander	Big	Mac	3rd base	2017-07-18 14:41:08.530408-05	2017-07-18 14:41:08.530408-05
4	ricky@gmail.com	highlander	Ricardo	Roman	catcher	2017-07-18 14:41:08.530408-05	2017-07-18 14:41:08.530408-05
\.


--
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vampaynani
--

SELECT pg_catalog.setval('players_id_seq', 4, true);


--
-- Data for Name: players_stat_catalogs; Type: TABLE DATA; Schema: public; Owner: vampaynani
--

COPY players_stat_catalogs (id, player_id, stat_catalog_id, how_many, game_date) FROM stdin;
1	1	1	6	2017-07-18 14:41:08.559-05
2	2	2	4	2017-07-18 14:41:08.559-05
3	3	3	2	2017-07-18 14:41:08.559-05
4	4	6	2	2017-07-18 14:41:08.559-05
5	1	2	2	2017-07-18 14:41:08.559-05
6	3	5	8	2017-07-18 14:41:08.559-05
7	4	5	8	2017-07-18 14:41:08.559-05
\.


--
-- Name: players_stat_catalogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vampaynani
--

SELECT pg_catalog.setval('players_stat_catalogs_id_seq', 7, true);


--
-- Data for Name: players_teams; Type: TABLE DATA; Schema: public; Owner: vampaynani
--

COPY players_teams (team_id, player_id, created_at, updated_at) FROM stdin;
1	4	2017-07-18 14:41:08.601787-05	2017-07-18 14:41:08.601787-05
1	2	2017-07-18 14:41:08.601787-05	2017-07-18 14:41:08.601787-05
2	3	2017-07-18 14:41:08.601787-05	2017-07-18 14:41:08.601787-05
3	2	2017-07-18 14:41:08.601787-05	2017-07-18 14:41:08.601787-05
4	4	2017-07-18 14:41:08.601787-05	2017-07-18 14:41:08.601787-05
3	3	2017-07-18 14:41:08.601787-05	2017-07-18 14:41:08.601787-05
2	1	2017-07-18 14:41:08.601787-05	2017-07-18 14:41:08.601787-05
1	1	2017-07-18 14:41:08.601787-05	2017-07-18 14:41:08.601787-05
4	1	2017-07-18 14:41:08.601787-05	2017-07-18 14:41:08.601787-05
\.


--
-- Data for Name: stat_catalogs; Type: TABLE DATA; Schema: public; Owner: vampaynani
--

COPY stat_catalogs (id, description) FROM stdin;
1	Hits
2	At Bats
3	Home Runs
4	Earned Runs
5	Innings Pitched
6	Strikeouts
\.


--
-- Name: stat_catalogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vampaynani
--

SELECT pg_catalog.setval('stat_catalogs_id_seq', 6, true);


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: vampaynani
--

COPY teams (id, name, city, state, game_date, created_at, updated_at) FROM stdin;
1	Highlanders	Bronx	NY	2017-07-18 14:41:08.584-05	2017-07-18 14:41:08.588786-05	2017-07-18 14:41:08.588786-05
2	Gem Stars	Queens	NY	2017-07-18 14:41:08.584-05	2017-07-18 14:41:08.588786-05	2017-07-18 14:41:08.588786-05
3	Warriors	Brooklyn	NY	2017-07-18 14:41:08.584-05	2017-07-18 14:41:08.588786-05	2017-07-18 14:41:08.588786-05
4	Tigers	Bronx	NY	2017-07-18 14:41:08.584-05	2017-07-18 14:41:08.588786-05	2017-07-18 14:41:08.588786-05
\.


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vampaynani
--

SELECT pg_catalog.setval('teams_id_seq', 4, true);


--
-- Name: coaches coaches_pkey; Type: CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY coaches
    ADD CONSTRAINT coaches_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: players_stat_catalogs players_stat_catalogs_pkey; Type: CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY players_stat_catalogs
    ADD CONSTRAINT players_stat_catalogs_pkey PRIMARY KEY (id);


--
-- Name: stat_catalogs stat_catalogs_pkey; Type: CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY stat_catalogs
    ADD CONSTRAINT stat_catalogs_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: coaches_teams coaches_teams_coach_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY coaches_teams
    ADD CONSTRAINT coaches_teams_coach_id_foreign FOREIGN KEY (coach_id) REFERENCES coaches(id);


--
-- Name: coaches_teams coaches_teams_team_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY coaches_teams
    ADD CONSTRAINT coaches_teams_team_id_foreign FOREIGN KEY (team_id) REFERENCES teams(id);


--
-- Name: players_stat_catalogs players_stat_catalogs_player_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY players_stat_catalogs
    ADD CONSTRAINT players_stat_catalogs_player_id_foreign FOREIGN KEY (player_id) REFERENCES players(id);


--
-- Name: players_stat_catalogs players_stat_catalogs_stat_catalog_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY players_stat_catalogs
    ADD CONSTRAINT players_stat_catalogs_stat_catalog_id_foreign FOREIGN KEY (stat_catalog_id) REFERENCES stat_catalogs(id);


--
-- Name: players_teams players_teams_player_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY players_teams
    ADD CONSTRAINT players_teams_player_id_foreign FOREIGN KEY (player_id) REFERENCES players(id);


--
-- Name: players_teams players_teams_team_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: vampaynani
--

ALTER TABLE ONLY players_teams
    ADD CONSTRAINT players_teams_team_id_foreign FOREIGN KEY (team_id) REFERENCES teams(id);


--
-- PostgreSQL database dump complete
--

