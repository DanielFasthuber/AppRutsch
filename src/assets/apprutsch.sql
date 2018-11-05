CREATE TABLE IF NOT EXISTS user (
user_id INTEGER PRIMARY KEY AUTOINCREMENT,
vorname VARCHAR (25),
nachname VARCHAR (25),
passwort VARCHAR (25)
);

CREATE TABLE IF NOT EXISTS landslide (
	slide_id INTEGER PRIMARY KEY AUTOINCREMENT,
	title	VARCHAR (35),
	datum VARCHAR (35),
	user_lat DOUBLE,
	user_long DOUBLE,
	slide_lat DOUBLE,
	slide_long DOUBLE,
	foto_count INTEGER,
	video_count INTEGER,
	memo_count INTEGER,
	user_id	INTEGER,
	thumbnail VARCHAR(50),
	FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE IF NOT EXISTS foto (
foto_id INTEGER PRIMARY KEY AUTOINCREMENT,
foto_path VARCHAR(50),
time_stamp TIMESTAMP,
slide_id INTEGER,
FOREIGN KEY (slide_id) REFERENCES landslide(slide_id)
);

CREATE TABLE IF NOT EXISTS video (
video_id INTEGER PRIMARY KEY AUTOINCREMENT,
video_path VARCHAR(50),
video_thumbnail VARCHAR(50),
time_stamp TIMESTAMP,
slide_id INTEGER,
FOREIGN KEY (slide_id) REFERENCES landslide(slide_id)
);

CREATE TABLE IF NOT EXISTS memo (
memo_id INTEGER PRIMARY KEY AUTOINCREMENT,
memo_path VARCHAR(50),
time_stamp TIMESTAMP,
slide_id INTEGER,
FOREIGN KEY (slide_id) REFERENCES landslide(slide_id)
);

INSERT INTO user VALUES(NULL,'Lisa', 'Wald', 'lisawald'),(NULL,'Stefan', 'Baum', 'stefanbaum'),(NULL,'Eva', 'Berg', 'evaberg'),(NULL,'Fred', 'Grass', 'fredgrass');

INSERT INTO landslide VALUES(NULL,'Landslide Matrei Osttirol', '2017-11-21 11:42:03', 47.055758, 12.523268, 47.055860, 12.524727,3,2,0,1, 'N/A');
INSERT INTO landslide VALUES(NULL,'Sankt Andrae', '2017-10-11 17:02:33', 47.010513, 12.348951, 47.009489, 12.349423,2,2,0, 1,'N/A');
INSERT INTO landslide VALUES(NULL,'Erdrutsch Hinterstoder', '2017-10-29 13:12:03', 47.706462, 14.161677, 47.707718, 14.159456,1,1,0, 2, 'N/A');
INSERT INTO landslide VALUES(NULL,'Mure bei Straße', '2017-08-09 21:02:53', 47.768667, 14.209403, 47.769612, 14.207922,2,1,0, 3, 'N/A');
INSERT INTO landslide VALUES(NULL,'Rutsch Ennstal', '2017-11-09 14:19:23', 47.577835, 14.589578, 47.577560, 14.590308,0,0,0, 2, 'N/A');
INSERT INTO landslide VALUES(NULL,'Schlammlawine Windischgarsten', '2018-01-06 09:45:12', 47.732983, 14.342698, 47.732362, 14.345133,1,1,0, 4, 'N/A');
INSERT INTO landslide VALUES(NULL,'Rutsch bei Peißling', '2018-01-06 10:55:22', 47.7221, 14.2647, 47.7228, 14.2622,1,1,0, 4, 'N/A');

INSERT INTO video values (NULL, 'PathVideo1ls1', 'PathThumbnail1ls1', NULL, 1);
INSERT INTO video values (NULL, 'PathVideo2ls1', 'PathThumbnail2ls1', NULL, 1);
INSERT INTO video values (NULL, 'PathVideo1ls2', 'PathThumbnail1ls2', NULL, 2);
INSERT INTO video values (NULL, 'PathVideo2ls2', 'PathThumbnail2ls2', NULL, 2);
INSERT INTO video values (NULL, 'PathVideo1ls3', 'PathThumbnail1ls3', NULL, 3);
INSERT INTO video values (NULL, 'PathVideo1ls4', 'PathThumbnail1ls4', NULL, 4);
INSERT INTO video values (NULL, 'PathVideo1ls6', 'PathThumbnail1ls6', NULL, 6);
INSERT INTO video values (NULL, 'PathVideo1ls7', 'PathThumbnail1ls7', NULL, 7);

INSERT INTO foto values (NULL, 'Pathfoto1ls1', NULL, 1);
INSERT INTO foto values (NULL, 'Pathfoto2ls1', NULL, 1);
INSERT INTO foto values (NULL, 'Pathfoto3ls1', NULL, 1);
INSERT INTO foto values (NULL, 'Pathfoto1ls2', NULL, 2);
INSERT INTO foto values (NULL, 'Pathfoto2ls2', NULL, 2);
INSERT INTO foto values (NULL, 'Pathfoto1ls3', NULL, 3);
INSERT INTO foto values (NULL, 'Pathfoto1ls4', NULL, 4);
INSERT INTO foto values (NULL, 'Pathfoto2ls4', NULL, 4);
INSERT INTO foto values (NULL, 'Pathfoto1ls6', NULL, 6);
INSERT INTO foto values (NULL, 'Pathfoto1ls7', NULL, 7);
