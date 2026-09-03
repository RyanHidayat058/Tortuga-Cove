<?php

namespace App\Services;

class WordleWordBank
{
    /**
     * Curated target secret words (common, popular, recognizable 5-letter everyday Indonesian words).
     *
     * @var array<int, string>
     */
    public static array $targetWords = [
        'KAPAL', 'OMBAK', 'BADAI', 'HARTA', 'KUNCI', 'SURGA', 'LAYAR', 'KABIN',
        'PANTA', 'PANDU', 'RUTIN', 'SURAT', 'PASIR', 'KORAL', 'JALAN', 'PULAU',
        'TIMUR', 'BARAT', 'UTARA', 'SELAT', 'DARAT', 'IKLIM', 'BADAN', 'KABUT',
        'SIHIR', 'HUJAN', 'ANGIN', 'KILAT', 'PETIR', 'PISAU', 'KAPUR', 'BALOK',
        'KAPAS', 'JELAS', 'KABAR', 'KAYUH', 'RANUM', 'SUBUH', 'SIANG', 'MALAM',
        'SENJA', 'FAJAR', 'BULAN', 'CANDI', 'CERIA', 'DAMAI', 'ELANG', 'GAJAH',
        'IKLAN', 'JAKET', 'KAMAR', 'MAWAR', 'NANAS', 'ORANG', 'PAGAR', 'RACUN',
        'SABUN', 'TABUR', 'UDARA', 'WAJAH', 'ZAMAN', 'ABADI', 'AKTOR', 'ALAMI',
        'BAGUS', 'BAKSO', 'BENAR', 'BERAS', 'BETUL', 'BIJAK', 'BOTOL', 'BUAYA',
        'BUNGA', 'CABAI', 'CALON', 'CINTA', 'DADAR', 'DANAU', 'DARAH', 'DAUN',
        'DUDUK', 'EMPAT', 'FOKUS', 'GARAM', 'GELAS', 'GITAR', 'HAKIM', 'HANTU',
        'HARGA', 'HASIL', 'HEWAN', 'HIDUP', 'HIJAU', 'HITAM', 'HOTEL', 'HUTAN',
        'INDAH', 'ISLAM', 'JALUR', 'JAMUR', 'JARUM', 'JERUK', 'JUARA', 'JUDUL',
        'JUMAT', 'KADAL', 'KAKAK', 'KAKUS', 'KAMIS', 'KAMUS', 'KANAL', 'KARET',
        'KARTU', 'KASIH', 'KASUR', 'KATAK', 'KELAS', 'KERAS', 'KERJA', 'KICAU',
        'KIPAS', 'KORAN', 'KOTAK', 'KOTOR', 'KUKIS', 'KULIT', 'KURSI', 'LALAT',
        'LAMPU', 'LEBAH', 'LEHER', 'LEMON', 'LIDAH', 'LILIN', 'LIPAT', 'LOMBA',
        'LUMBA', 'MACAN', 'MAKAN', 'MARET', 'MASAK', 'MASUK', 'MEDAL', 'MELON',
        'MENIT', 'MERAH', 'MESIN', 'MINUM', 'MOBIL', 'MOTOR', 'MULUT', 'MUSIK',
        'MUSIM', 'NAFAS', 'NENEK', 'NOMOR', 'NOVEL', 'PANAS', 'PANEN', 'PAPAN',
        'PASAR', 'PEDAS', 'PELAN', 'PERUT', 'PINTU', 'POHON', 'PUTIH', 'PUTRA',
        'PUTRI', 'RADIO', 'RAKIT', 'RAPAT', 'RESEP', 'ROBOT', 'RUKUN', 'RUMAH',
        'SABUK', 'SALAM', 'SALJU', 'SAYUR', 'SEDAP', 'SEHAT', 'SEMEN', 'SENDI',
        'SEPAK', 'SETIA', 'SINGA', 'SOPIR', 'SUARA', 'SURAU', 'TABEL', 'TAHUN',
        'TAMAN', 'TANAH', 'TELUR', 'TEMAN', 'TIDUR', 'TIKUS', 'TOMAT', 'TUGAS',
        'TULIS', 'TUPAI', 'UDANG', 'UNTUK', 'USAHA', 'UTAMA', 'VIRUS', 'WAKTU',
        'WARNA', 'SUJUD', 'WUJUD', 'SALAT', 'SHLAT', 'ZIKIR', 'MANDI', 'PUNYA',
        'BUTUH', 'MINTA', 'SAYANG', 'BENCI', 'MARAH', 'SEDIH', 'SENANG', 'KEREN',
        'MANIS', 'PAHIT', 'ASIN', 'TAWAR', 'GURIH', 'DOSEN', 'MURID', 'KAWAN',
        'SOBAT', 'PACAR', 'JODOH', 'SUAMI', 'ISTRI', 'BAPAK', 'PAMAN', 'LANTAI',
        'BANTAL', 'EMBER', 'SAMPO', 'SIKAT', 'PASTA', 'HANDUK', 'SEPATU', 'SANDAL',
        'DOMPET', 'SEPEDA', 'PERAHU', 'KAFE', 'WARUNG', 'KEBUN', 'SAWAH', 'BUKIT',
        'LEMBAH', 'SUNGAI', 'LUMPUR', 'KUCING', 'ANJING', 'BURUNG', 'BEBEK', 'KELINCI',
    ];

    /**
     * Additional valid 5-letter Indonesian words for guess validation (Daily conversational & common Indonesian).
     *
     * @var array<int, string>
     */
    public static array $validWords = [
        'ABADI', 'ABANG', 'ABJAD', 'ABSEN', 'ACARA', 'ACUAN', 'ADUAN', 'AGAMA',
        'AGUNG', 'AJANG', 'AKRAB', 'AKSES', 'AKTOR', 'AKUAN', 'ALAMI', 'ALANG',
        'ALIAS', 'AMANG', 'AMBIL', 'AMPUN', 'ANDAL', 'ANGIN', 'ANGKA', 'ANGSA',
        'ANTAR', 'ANTRI', 'ANYAR', 'APUNG', 'ARANG', 'ARENA', 'AROMA', 'ARSIP',
        'ARUNG', 'ARWAH', 'ASING', 'ASPEK', 'ATLAS', 'BABAK', 'BABAT', 'BADAI',
        'BADAK', 'BADAN', 'BAGAI', 'BAGUS', 'BAHAN', 'BAJAK', 'BAKSO', 'BAKAT',
        'BALAP', 'BALAS', 'BALIK', 'BALOK', 'BAMBU', 'BANAL', 'BANDA', 'BANTU',
        'BANYU', 'BAPAK', 'BARAT', 'BARIS', 'BASAH', 'BASIS', 'BATAL', 'BATAS',
        'BATIK', 'BATIN', 'BATUK', 'BAWAH', 'BAYAM', 'BAYAR', 'BEBAS', 'BEBEK',
        'BEKAL', 'BEKAS', 'BELAH', 'BELAS', 'BELUT', 'BENAR', 'BENCI', 'BENDA',
        'BENIH', 'BERAS', 'BERAT', 'BERES', 'BESAR', 'BESOK', 'BETUL', 'BIASA',
        'BIAYA', 'BIBIR', 'BIBIT', 'BIDIK', 'BIJAK', 'BINAR', 'BIOLA', 'BISIK',
        'BOCAH', 'BODOH', 'BOLEH', 'BOMBA', 'BOROS', 'BOTAK', 'BOTOL', 'BUAYA',
        'BUBUR', 'BUDUR', 'BUJUR', 'BUKAN', 'BUKIT', 'BUKTI', 'BULAN', 'BULAT',
        'BUMBU', 'BUMIL', 'BUNGA', 'BUNYI', 'BURUK', 'BUTUH', 'CABAI', 'CACAT',
        'CADAR', 'CAKAP', 'CAKAR', 'CALON', 'CANDI', 'CAPAI', 'CATAT', 'CATUR',
        'CAWAN', 'CEGAH', 'CEPAT', 'CERAH', 'CERIA', 'CICIL', 'CINTA', 'COCOK',
        'CORAK', 'CUKUP', 'CURAM', 'DADAR', 'DAKWA', 'DAMAI', 'DANAU', 'DAPAT',
        'DAPUR', 'DARAH', 'DARAT', 'DASAR', 'DEBAR', 'DEKAT', 'DEPAN', 'DERAS',
        'DESAK', 'DETIK', 'DIDIK', 'DUDUK', 'DUSUN', 'EBONI', 'EJAAN', 'ELANG',
        'EMPAT', 'ENZIM', 'FAJAR', 'FAKTA', 'FASIH', 'FIBER', 'FIKIR', 'FISIK',
        'FOKUS', 'FORUM', 'GABAS', 'GADIS', 'GAGAL', 'GAGAS', 'GAJAH', 'GALAK',
        'GALAU', 'GALUR', 'GANDA', 'GARAM', 'GARIS', 'GARPU', 'GAUNG', 'GELAP',
        'GELAS', 'GEMPA', 'GEMUK', 'GENAP', 'GERAK', 'GERAM', 'GETAR', 'GIGIT',
        'GITAR', 'GOLOK', 'GUGUR', 'GULAT', 'GULIR', 'GURAU', 'GURIH', 'HABIS',
        'HADAP', 'HADIR', 'HAFAL', 'HAJAT', 'HAKIM', 'HALAL', 'HALUS', 'HAMBA',
        'HAMIL', 'HANTU', 'HAPUS', 'HARAP', 'HARGA', 'HARTA', 'HARUM', 'HARUS',
        'HASIL', 'HEBAT', 'HEMAT', 'HERAN', 'HEWAN', 'HIDUP', 'HIJAU', 'HIKMA',
        'HITAM', 'HOTEL', 'HUJAN', 'HUKUM', 'HURUF', 'HUTAN', 'IKLAN', 'IKLIM',
        'IKRAR', 'ILHAM', 'IMBAS', 'INDAH', 'INDUK', 'INFRA', 'INGAT', 'INGIN',
        'INTAN', 'IRAMA', 'IRING', 'ISENG', 'ISLAM', 'ISTRI', 'JABAT', 'JAHAT',
        'JAHIT', 'JAJAN', 'JAKET', 'JALAN', 'JALUR', 'JAMAN', 'JAMBU', 'JAMUR',
        'JANJI', 'JARAK', 'JARUM', 'JATUH', 'JAWAB', 'JEJAK', 'JELAS', 'JELUK',
        'JEPIT', 'JERUK', 'JINAK', 'JIWA', 'JODOH', 'JUARA', 'JUDUL', 'JUJUR',
        'JUMAT', 'JUMPA', 'KABAR', 'KABEL', 'KABIN', 'KABUR', 'KABUT', 'KACAU',
        'KADAL', 'KADAR', 'KAGUM', 'KAJIAN', 'KAKAK', 'KAKUS', 'KALAH', 'KALAU',
        'KALBU', 'KALIM', 'KAMAR', 'KAMIS', 'KAMUS', 'KANAL', 'KANAN', 'KAPAL',
        'KAPAS', 'KAPUR', 'KARAM', 'KARET', 'KARMA', 'KARSA', 'KARTA', 'KARTU',
        'KASIH', 'KASIR', 'KASUR', 'KASUS', 'KATAK', 'KATUR', 'KAWAN', 'KAWAT',
        'KAYUH', 'KEBAL', 'KEBAS', 'KEBUN', 'KECIL', 'KECAP', 'KEDAI', 'KEDOK',
        'KEJAR', 'KEJAP', 'KEJUT', 'KELAS', 'KELOR', 'KELUH', 'KEMAH', 'KEMAL',
        'KEMAS', 'KENAL', 'KENAN', 'KENTI', 'KEPALA', 'KERAS', 'KERJA', 'KERUH',
        'KESAL', 'KETAT', 'KETUA', 'KHAAS', 'KHUS', 'KICAU', 'KIPAS', 'KIRIM',
        'KISAH', 'KITAB', 'KOBAR', 'KOCOK', 'KOLAM', 'KOMIK', 'KORAL', 'KORAN',
        'KORPS', 'KORSI', 'KORUP', 'KOTAK', 'KOTOR', 'KREDIT', 'KUASA', 'KUBIS',
        'KUBUR', 'KUCUR', 'KUDAP', 'KUKUH', 'KUKUS', 'KULIT', 'KUMIS', 'KUMUR',
        'KUNCI', 'KURMA', 'KURSI', 'KURUS', 'KUTIP', 'KUTUB', 'LABIL', 'LABUH',
        'LAFAL', 'LAGEN', 'LAHIR', 'LAJUR', 'LAKON', 'LALAT', 'LAMAR', 'LAMBA',
        'LAMPU', 'LANDA', 'LANTA', 'LAPAR', 'LAPIS', 'LAPOR', 'LARAS', 'LARIS',
        'LARUT', 'LATAR', 'LAWAN', 'LAYAK', 'LAYAN', 'LAYAR', 'LAZIM', 'LEBAH',
        'LEBAR', 'LEBAT', 'LEBIH', 'LEBUR', 'LEHER', 'LEKAS', 'LEKUK', 'LEMAH',
        'LEMAR', 'LEMON', 'LENSA', 'LEPAS', 'LEREP', 'LETUS', 'LEWAT', 'LEZAT',
        'LIDAH', 'LIHAT', 'LILIN', 'LIPAT', 'LIRIK', 'LITER', 'LOBIS', 'LOGAM',
        'LOGIS', 'LOKAL', 'LOKASI', 'LOMBA', 'LONDO', 'LONJA', 'LONTAR', 'LUBANG',
        'LUGAS', 'LULUR', 'LULUS', 'LUMBA', 'LUMUR', 'LUMUT', 'LUNAK', 'LUNAS',
        'LURUS', 'LUTUT', 'MABUK', 'MACAN', 'MACET', 'MADYA', 'MAGER', 'MAGIS',
        'MAHAL', 'MAHIR', 'MAJAS', 'MAJIK', 'MAJAL', 'MAKAN', 'MAKAM', 'MAKAR',
        'MAKIN', 'MAKNA', 'MAKRO', 'MALAI', 'MALAM', 'MALAS', 'MALU', 'MAMPU',
        'MANFA', 'MANIS', 'MANJA', 'MAPAN', 'MARAH', 'MARET', 'MARGA', 'MASA',
        'MASAK', 'MASIH', 'MASSA', 'MASUK', 'MATAH', 'MATAN', 'MATUR', 'MAWAR',
        'MAYAT', 'MEDAL', 'MEDIS', 'MEGAR', 'MEKAR', 'MELAT', 'MELON', 'MEMAR',
        'MENIT', 'MENOR', 'MENTA', 'MERAH', 'MEREK', 'MERDU', 'MESIN', 'MESKI',
        'MESTI', 'METRO', 'MIMPI', 'MINAT', 'MINTA', 'MINUM', 'MISAL', 'MISIK',
        'MISIN', 'MITOS', 'MOBIL', 'MODAL', 'MODEL', 'MODEM', 'MODIS', 'MOGOK',
        'MOHON', 'MOLEK', 'MORAL', 'MOTIF', 'MOTOR', 'MUARA', 'MUDAH', 'MUDIK',
        'MUJAR', 'MUKIM', 'MULAI', 'MULIA', 'MULUT', 'MUMET', 'MUNDU', 'MUPAT',
        'MURAH', 'MURID', 'MURKA', 'MURNI', 'MUSIK', 'MUSIM', 'MUSUH', 'MUTASI',
        'MUTU', 'NADIR', 'NAFAS', 'NAIK', 'NAKAL', 'NALAR', 'NAMUN', 'NANAS',
        'NANAR', 'NANTI', 'NAPAS', 'NASIB', 'NASIP', 'NASIH', 'NEKAD', 'NEKAT',
        'NENEK', 'NETRA', 'NIKAH', 'NILAI', 'NISAN', 'NISTA', 'NOMOR', 'NORMA',
        'NOVEL', 'NYATA', 'NYERI', 'OBRAL', 'ODONG', 'OLEH', 'OMBAK', 'ONGKO',
        'OPINI', 'ORANG', 'ORASI', 'ORGAN', 'ORGIN', 'ORMON', 'ORPES', 'OTENT',
        'OTW', 'PABRK', 'PACAR', 'PADAM', 'PADAT', 'PAGAR', 'PAGAR', 'PAHAM',
        'PAHIT', 'PAJAK', 'PAKAI', 'PAKAR', 'PAKET', 'PAKSA', 'PAKTI', 'PALEM',
        'PALSU', 'PAMER', 'PAMIT', 'PANAH', 'PANAS', 'PANCI', 'PANDU', 'PANEL',
        'PANEN', 'PANIK', 'PAPAN', 'PARAS', 'PARIT', 'PARUH', 'PASAR', 'PASIF',
        'PASIR', 'PASTA', 'PATUH', 'PATUT', 'PAWAI', 'PAYAH', 'PAYUN', 'PECAT',
        'PEDAL', 'PEDAS', 'PEGAL', 'PEGAN', 'PEKIK', 'PELAN', 'PELAT', 'PELIK',
        'PELOP', 'PELOR', 'PELUK', 'PENDE', 'PENGG', 'PENUH', 'PERAH', 'PERAK',
        'PERAN', 'PERAS', 'PERIH', 'PERLU', 'PERMA', 'PERSA', 'PERUT', 'PESAN',
        'PESAT', 'PESIS', 'PESTA', 'PETAK', 'PETAN', 'PETIK', 'PETIR', 'PIANO',
        'PICIK', 'PIDAN', 'PIHAK', 'PIJAR', 'PIKIR', 'PIKUL', 'PILAH', 'PILIH',
        'PINDA', 'PINIS', 'PINTA', 'PINTU', 'PIPIN', 'PIPIT', 'PISAH', 'PISAU',
        'PITA', 'PLAST', 'PLENO', 'PODIU', 'POHON', 'POKOK', 'POLOS', 'POMPA',
        'POROS', 'PORSI', 'POSIS', 'POTON', 'PRADA', 'PRIBU', 'PRIMA', 'PROFE',
        'PROMO', 'PROSA', 'PROSE', 'PUASA', 'PUAS', 'PUCUK', 'PUGAR', 'PUJIA',
        'PUKUL', 'PULAU', 'PULIH', 'PULSA', 'PUNCA', 'PUNYA', 'PUPUK', 'PUPUS',
        'PURBA', 'PUSAT', 'PUSIN', 'PUTAR', 'PUTIH', 'PUTRA', 'PUTRI', 'PUTUS',
        'RABUN', 'RACUN', 'RADAR', 'RADIO', 'RAGAM', 'RAHIB', 'RAHIM', 'RAIH',
        'RAJIN', 'RAJUK', 'RAKIT', 'RAKUS', 'RAMAH', 'RAMAI', 'RAMAL', 'RAMBU',
        'RAMPA', 'RAMUT', 'RANCA', 'RANDA', 'RANGK', 'RANGS', 'RANTA', 'RANTE',
        'RANUM', 'RAPAT', 'RAPUH', 'RASA', 'RASIO', 'RASUL', 'RATAP', 'RATIO',
        'RAUNG', 'RAUP', 'RAWAN', 'RAWAT', 'RAYAP', 'RAYAU', 'RAYUN', 'REBAH',
        'REBUN', 'REBUT', 'RECET', 'REDAK', 'REDAM', 'REDUP', 'REHAT', 'REKOR',
        'RELIK', 'REMAH', 'REMAS', 'RENDA', 'RENGG', 'REPOT', 'RESEP', 'RESID',
        'RESMI', 'RESOR', 'RETUR', 'REZKI', 'RIANG', 'RIBUT', 'RIMBA', 'RINDU',
        'RINGA', 'RINTI', 'RISAU', 'RISET', 'RISIK', 'RITEL', 'RITME', 'ROBOH',
        'ROBOT', 'ROKET', 'RONDA', 'ROTAN', 'RUANG', 'RUBIK', 'RUJAK', 'RUKUN',
        'RUMAH', 'RUMIT', 'RUMOR', 'RUMPU', 'RUMUT', 'RUNCI', 'RUNTU', 'RUPIS',
        'RUSA', 'RUSAK', 'RUSUK', 'RUTIN', 'SABAR', 'SABIK', 'SABIT', 'SABUK',
        'SABUN', 'SADAR', 'SADIS', 'SAFAR', 'SAGIT', 'SAHAT', 'SAHIT', 'SAHUR',
        'SAING', 'SAJAK', 'SAJIA', 'SAKIT', 'SALAH', 'SALAM', 'SALDO', 'SALEP',
        'SALIN', 'SALJU', 'SALON', 'SALUR', 'SAMAR', 'SAMBA', 'SAMBI', 'SAMBU',
        'SAMPA', 'SAMPO', 'SAMUR', 'SANAT', 'SANDA', 'SANDI', 'SANGG', 'SANGK',
        'SANTU', 'SAPAR', 'SARAN', 'SARAP', 'SARI', 'SARIK', 'SARUN', 'SASAR',
        'SATIR', 'SATUA', 'SATUR', 'SAUDI', 'SAUNA', 'SAUS', 'SAWAH', 'SAWIR',
        'SAYAP', 'SAYAT', 'SAYUR', 'SEBAB', 'SEBAR', 'SEBUT', 'SEDAP', 'SEDAT',
        'SEDER', 'SEDIA', 'SEDIH', 'SEDOT', 'SEGAN', 'SEGAR', 'SEHAT', 'SEJAT',
        'SEJUK', 'SEKAT', 'SEKOR', 'SEKSI', 'SELAM', 'SELAS', 'SELAT', 'SELEB',
        'SELIK', 'SELOR', 'SELUR', 'SEMAN', 'SEMAR', 'SEMBR', 'SEMEN', 'SEMIT',
        'SEMPI', 'SEMUR', 'SENAD', 'SENAN', 'SENAR', 'SENAT', 'SENDA', 'SENDI',
        'SENGG', 'SENIN', 'SENJA', 'SENSO', 'SENTR', 'SENYA', 'SEPAK', 'SEPAT',
        'SEPED', 'SEPER', 'SEPUH', 'SERAG', 'SERAI', 'SERAM', 'SERAP', 'SERAT',
        'SERBA', 'SERBU', 'SEREP', 'SERI', 'SERTA', 'SERUN', 'SERVI', 'SESAL',
        'SESAT', 'SESI', 'SESOB', 'SESUA', 'SETAN', 'SETEL', 'SETIA', 'SETIR',
        'SETOP', 'SEWA', 'SIAK', 'SIANG', 'SIAP', 'SIAPA', 'SIFAT', 'SIGAP',
        'SIHIR', 'SIKAP', 'SIKAT', 'SIKSA', 'SILAN', 'SILAP', 'SILAT', 'SILAU',
        'SIMBA', 'SIMBO', 'SIMPA', 'SIMPU', 'SINAR', 'SINGA', 'SINGK', 'SINIS',
        'SINTA', 'SIPIL', 'SIPIT', 'SIRAM', 'SIRAT', 'SIRIK', 'SIRNA', 'SIRUP',
        'SISA', 'SISIP', 'SISIR', 'SISWA', 'SISTE', 'SITIR', 'SITUS', 'SKALA',
        'SOBAT', 'SODOR', 'SOPAN', 'SOPIR', 'SOROT', 'SOSIS', 'SPASI', 'SPONT',
        'SUAMI', 'SUARA', 'SUBUH', 'SUCI', 'SUDUT', 'SUDAH', 'SUJUD', 'SUKMA',
        'SULAM', 'SULIT', 'SULUH', 'SUMBU', 'SUMPA', 'SUNGA', 'SUNYI', 'SUPIR',
        'SURAT', 'SURAU', 'SURGA', 'SURUH', 'SUSAH', 'SUSUK', 'SUSUN', 'SUSUR',
        'SUTRA', 'SYAIR', 'TABEL', 'TABIR', 'TABUH', 'TABUR', 'TAHUN', 'TAJAM',
        'TAKUT', 'TAMAN', 'TANAH', 'TANDA', 'TANYA', 'TAPIS', 'TARIK', 'TARUH',
        'TASIK', 'TAWAR', 'TEBAL', 'TEBAS', 'TEGAK', 'TEGAS', 'TEGUH', 'TEGUR',
        'TEKAD', 'TEKAN', 'TEKUN', 'TELAN', 'TELOR', 'TELUK', 'TELUR', 'TEMAN',
        'TEMPA', 'TEMPO', 'TENDA', 'TENTU', 'TEPAT', 'TEPUK', 'TERAS', 'TERIK',
        'TERUS', 'TETAP', 'TETES', 'TIANG', 'TIDUR', 'TIKUS', 'TIMUR', 'TINTA',
        'TIPIS', 'TITIK', 'TOKOH', 'TOMAT', 'TOTAL', 'TUGAS', 'TUHAN', 'TUJUH',
        'TUKAR', 'TUKUL', 'TULIS', 'TULUS', 'TUMIS', 'TUNAS', 'TUTUP', 'TUTUR',
        'UDANG', 'UDARA', 'UJIAN', 'ULANG', 'UNSUR', 'UNTUK', 'UPAYA', 'URBAN',
        'USAHA', 'UTAMA', 'UTARA', 'VIDEO', 'VIRAL', 'VIRUS', 'VOKAL', 'WADAH',
        'WAJAR', 'WAJAH', 'WAJIB', 'WAKIL', 'WAKTU', 'WALAU', 'WANGI', 'WARIS',
        'WARNA', 'WATAK', 'WUJUD', 'YAKIN', 'ZAMAN', 'ZAKAT', 'ZIKIR', 'SALAT',
        'SEGAR', 'BERSI', 'LEBUR', 'JATUH', 'BAHAN', 'KASAR', 'HALUS', 'TEPAT',
    ];

    /**
     * Normalize string to standard 5-letter uppercase.
     */
    public static function normalize(string $word): string
    {
        return strtoupper(trim($word));
    }

    /**
     * Get a random 5-letter target secret word, avoiding given excluded words if possible.
     *
     * @param  array<int, string>  $excludeWords
     */
    public static function getRandomTargetWord(array $excludeWords = []): string
    {
        $words = array_values(array_filter(self::$targetWords, fn ($w) => strlen($w) === 5));

        $normalizedExcludes = array_map(fn ($w) => self::normalize($w), $excludeWords);
        $filtered = array_values(array_filter($words, fn ($w) => ! in_array($w, $normalizedExcludes, true)));

        $pool = count($filtered) > 0 ? $filtered : $words;

        return $pool[array_rand($pool)];
    }

    /**
     * Check if a 5-letter guess exists in valid dictionary or is a clean 5-letter alphabetical word.
     */
    public static function isValidWord(string $word): bool
    {
        $normalized = self::normalize($word);
        if (strlen($normalized) !== 5) {
            return false;
        }

        // Must be 5 alphabetic letters
        if (! preg_match('/^[A-Z]{5}$/', $normalized)) {
            return false;
        }

        // Check if present in our word banks
        if (in_array($normalized, self::$targetWords, true) || in_array($normalized, self::$validWords, true)) {
            return true;
        }

        // Allow any reasonable 5-letter Indonesian word with vowels to prevent frustrating "word not found" on daily words
        $hasVowel = preg_match('/[AEIOU]/', $normalized);

        return (bool) $hasVowel;
    }
}
