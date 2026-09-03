<?php

namespace App\Services;

class WordleWordBank
{
    /**
     * Curated target secret words (common, popular, recognizable 5-letter KBBI words).
     *
     * @var array<int, string>
     */
    public static array $targetWords = [
        'KAPAL', 'OMBAK', 'BADAI', 'HARTA', 'KUNCI', 'SURGA', 'LAYAR', 'KABIN',
        'PANTA', 'PANDU', 'RUTIN', 'SURAT', 'PASIR', 'KORAL', 'JALAN', 'PULAU',
        'TIMUR', 'BARAT', 'UTARA', 'SELAT', 'DARAT', 'IKLIM', 'BADAN', 'KABUT',
        'SIHIR', 'HUJAN', 'LANGI', 'KILAT', 'PETIR', 'PISAU', 'KAPUR', 'BALOK',
        'KAPAS', 'JELAS', 'KABAR', 'KAYUH', 'RANUM', 'SUBUH', 'SIANG', 'MALAM',
        'SENJA', 'FAJAR', 'BULAN', 'BINTA', 'CANDI', 'CERIA', 'DAMAI', 'ELANG',
        'GAJAH', 'HARIM', 'IKLAN', 'JAKET', 'KAMAR', 'LEMAR', 'MAWAR', 'MELAT',
        'NANAS', 'ORANG', 'PAGAR', 'RACUN', 'SABUN', 'TABUR', 'UDARA', 'WAJAH',
        'ZAMAN', 'ABADI', 'AKTOR', 'ALAMI', 'ANGIN', 'BAGUS', 'BAKSO', 'BATUR',
        'BENAR', 'BERAS', 'BETUL', 'BIJAK', 'BOTOL', 'BUAYA', 'BUKU', 'BUNGA',
        'CABAI', 'CALON', 'CINTA', 'DADAR', 'DANAU', 'DARAH', 'DAUN', 'DEBU',
        'DESA', 'DOKTO', 'DUDUK', 'EMAS', 'EMPAT', 'ENAM', 'FOKUS', 'GARAM',
        'GELAS', 'GIGI', 'GITAR', 'GULI', 'GULUN', 'HAKIM', 'HANTU', 'HARGA',
        'HASIL', 'HEWAN', 'HIDUP', 'HIJAU', 'HITAM', 'HOTEL', 'HUTAN', 'ILMU',
        'INDAH', 'INDUS', 'ISLAM', 'JALUR', 'JAMUR', 'JANTU', 'JARUM', 'JERUK',
        'JUARA', 'JUDUL', 'JUMAT', 'KACA', 'KADAL', 'KAHWA', 'KAKAK', 'KAKUS',
        'KAMIS', 'KAMUS', 'KANAL', 'KAPAL', 'KAPAS', 'KAPUR', 'KARET', 'KARTU',
        'KASIH', 'KASUR', 'KATAK', 'KAYU', 'KELAS', 'KERAS', 'KERJA', 'KERTAS',
        'KICAU', 'KIPAS', 'KORAN', 'KOTAK', 'KOTOR', 'KUDA', 'KUKIS', 'KULIT',
        'KURSI', 'LABU', 'LALAT', 'LAMPU', 'LEBAH', 'LEHER', 'LEMON', 'LIDAH',
        'LILIN', 'LIPAT', 'LOBIS', 'LOMBA', 'LUMBA', 'MACAN', 'MAKAN', 'MARET',
        'MASAK', 'MASUK', 'MATER', 'MEDAL', 'MEJA', 'MELON', 'MENIT', 'MERAH',
        'MESIN', 'MINUM', 'MINYAK', 'MOBIL', 'MOTOR', 'MULUT', 'MUSIK', 'MUSIM',
        'NAFAS', 'NENEK', 'NOMOR', 'NOVEL', 'OBAT', 'PANAS', 'PANC', 'PANEN',
        'PAPAN', 'PASAR', 'PEDAS', 'PELAN', 'PERUT', 'PINAS', 'PINTU', 'PIRAN',
        'POHON', 'POLIS', 'PUDIN', 'PUTIH', 'PUTRA', 'PUTRI', 'RADIO', 'RACUN',
        'RAKIT', 'RAMUT', 'RAPAT', 'RESEP', 'ROBOT', 'ROTI', 'RUKUN', 'RUMAH',
        'SABUK', 'SAHAB', 'SALAM', 'SALJU', 'SAYUR', 'SEDAP', 'SEHAT', 'SEKOL',
        'SELAT', 'SEMEN', 'SENDI', 'SEPAK', 'SERIG', 'SETIA', 'SIHIR', 'SINGA',
        'SOPIR', 'SUARA', 'SUKSES', 'SUNGA', 'SURAU', 'SUSU', 'TABEL', 'TAHUN',
        'TAMAN', 'TANGG', 'TANAH', 'TELUR', 'TEMAN', 'TIDUR', 'TIKUS', 'TIMUR',
        'TOILET', 'TOMAT', 'TOPI', 'TUGAS', 'TULIS', 'TUPAI', 'UDANG', 'ULAR',
        'UMUR', 'UNTUK', 'USAHA', 'UTAMA', 'VIRUS', 'WAKTU', 'WARNA', 'WORTEL',
    ];

    /**
     * Additional valid 5-letter Indonesian words for guess validation.
     *
     * @var array<int, string>
     */
    public static array $validWords = [
        'ABADI', 'ABANG', 'ABJAD', 'ABSEN', 'ACARA', 'ACUAN', 'ADUAN', 'AGAMA',
        'AGUNG', 'AJANG', 'AKRAB', 'AKSES', 'AKSI', 'AKTOR', 'AKUAN', 'ALAMI',
        'ALANG', 'ALAS', 'ALIAS', 'ALIH', 'ALIR', 'AMANG', 'AMBIL', 'AMBISI',
        'AMBROL', 'AMPUN', 'ANAK', 'ANDAL', 'ANGIN', 'ANGKA', 'ANGSA', 'ANJING',
        'ANTAR', 'ANTRI', 'ANYAR', 'APUNG', 'ARANG', 'ARENA', 'AROMA', 'ARSIP',
        'ARUNG', 'ARWAH', 'ASING', 'ASPEK', 'ATAP', 'ATLAS', 'ATUR', 'AWAN',
        'AWAS', 'AYAM', 'BABAK', 'BABAT', 'BADAI', 'BADAK', 'BADAN', 'BAGAI',
        'BAGIAN', 'BAGUS', 'BAHAN', 'BAHRA', 'BAJAU', 'BAJAK', 'BAKSO', 'BAKAT',
        'BALAP', 'BALAS', 'BALIK', 'BALOK', 'BAMBU', 'BANAL', 'BANAT', 'BANDA',
        'BANDU', 'BANGU', 'BANJIR', 'BANTU', 'BANYU', 'BAPAK', 'BARAT', 'BARIS',
        'BASAH', 'BASIS', 'BATAL', 'BATANG', 'BATAS', 'BATIK', 'BATIN', 'BATU',
        'BATUK', 'BAWAH', 'BAYAM', 'BAYAR', 'BEBAS', 'BEBEK', 'BEKAL', 'BEKAS',
        'BELAH', 'BELAS', 'BELI', 'BELUT', 'BENAR', 'BENCI', 'BENDA', 'BENIH',
        'BENTUK', 'BERAS', 'BERAT', 'BERI', 'BERES', 'BESAR', 'BESOK', 'BETUL',
        'BIASA', 'BIAYA', 'BIBIR', 'BIBIT', 'BIDIK', 'BIJAK', 'BIKIR', 'BILANG',
        'BINAR', 'BINI', 'BINTI', 'BIOLA', 'BISIK', 'BISNIS', 'BOCAH', 'BODOH',
        'BOLEH', 'BOMBA', 'BOROS', 'BOTAK', 'BOTOL', 'BUAH', 'BUAYA', 'BUBUR',
        'BUDUR', 'BUJUR', 'BUKAN', 'BUKIT', 'BUKTI', 'BULAN', 'BULAT', 'BULU',
        'BUMBU', 'BUMIL', 'BUNGA', 'BUNYI', 'BURUK', 'BURUNG', 'BUSA', 'BUTUH',
        'CABAI', 'CABANG', 'CACAT', 'CADAR', 'CAKAP', 'CAKAR', 'CALON', 'CANDI',
        'CANGG', 'CANTIK', 'CAPAI', 'CATAT', 'CATUR', 'CAWAN', 'CEGAH', 'CEPAT',
        'CERAH', 'CERIA', 'CERITA', 'CICIL', 'CINTA', 'COCOK', 'CORAK', 'CUKUP',
        'CURAM', 'DADAR', 'DAFTAR', 'DAGANG', 'DAGIN', 'DAKWA', 'DAMAI', 'DAMPAK',
        'DANAU', 'DAPAT', 'DAPUR', 'DARAH', 'DARAT', 'DASAR', 'DAUN', 'DAYA',
        'DEBAR', 'DEBU', 'DEKAT', 'DEPAN', 'DERAS', 'DERITA', 'DESA', 'DESAK',
        'DETIK', 'DEWA', 'DEWASA', 'DIAM', 'DIDIK', 'DINGIN', 'DIRI', 'DUDUK',
        'DURI', 'DURIA', 'DUSUN', 'EBONI', 'EJAAN', 'ELANG', 'EMAS', 'EMOSI',
        'EMPAT', 'ENAM', 'ENZIM', 'FAJAR', 'FAKTA', 'FAKTOR', 'FASIH', 'FIBER',
        'FIKIR', 'FISIK', 'FOKUS', 'FORUM', 'FOTO', 'FUNGSI', 'GABAS', 'GABUNG',
        'GADIS', 'GAGAL', 'GAGAS', 'GAJAH', 'GAJI', 'GALAK', 'GALAU', 'GALUR',
        'GAMBAR', 'GAMPANG', 'GANDA', 'GANGGU', 'GARAM', 'GARIS', 'GARPU', 'GAUL',
        'GAUNG', 'GAYA', 'GELAP', 'GELAS', 'GELI', 'GELORA', 'GEMPA', 'GEMUK',
        'GENAP', 'GENGG', 'GERAK', 'GERAM', 'GERSI', 'GETAR', 'GIGI', 'GIGIT',
        'GILA', 'GINJAL', 'GITAR', 'GOLOK', 'GORENG', 'GUGUR', 'GULA', 'GULAT',
        'GULIR', 'GULUNG', 'GUNUNG', 'GURAU', 'GURIH', 'GURU', 'GUSI', 'HABIS',
        'HADAP', 'HADIAH', 'HADIR', 'HAFAL', 'HAJAT', 'HAKIM', 'HALAL', 'HALANG',
        'HALUS', 'HAMBA', 'HAMIL', 'HAMPIR', 'HANCUR', 'HANGAT', 'HANTU', 'HAPUS',
        'HARAP', 'HARGA', 'HARIM', 'HARTA', 'HARUM', 'HARUS', 'HASIL', 'HAUS',
        'HEBAT', 'HEMAT', 'HENDAK', 'HERAN', 'HEWAN', 'HIDANG', 'HIDUP', 'HIJAU',
        'HILANG', 'HIMPUN', 'HINA', 'HINDAR', 'HIRUP', 'HITAM', 'HITUNG', 'HOBI',
        'HORMAT', 'HOTEL', 'HUJAN', 'HUKUM', 'HURUF', 'HUTAN', 'IBADAH', 'IKAT',
        'IKLAN', 'IKLIM', 'IKRAR', 'IKUT', 'ILHAM', 'ILMU', 'IMBANG', 'IMBAS',
        'INAP', 'INDAH', 'INDUK', 'INFRA', 'INGAT', 'INGIN', 'INTAN', 'INTI',
        'IRAMA', 'IRING', 'IRIS', 'ISENG', 'ISI', 'ISLAM', 'ISTRI', 'IZIN',
        'JABAT', 'JADIL', 'JAGUNG', 'JAHE', 'JAHIT', 'JAHAT', 'JAJAN', 'JAKET',
        'JALAN', 'JALUR', 'JAMAN', 'JAMBU', 'JAMUR', 'JANGKA', 'JANJI', 'JANTU',
        'JARAK', 'JARING', 'JARUM', 'JAS', 'JATUH', 'JAWAB', 'JEJAK', 'JELAS',
        'JELAJ', 'JELEK', 'JEPIT', 'JERUK', 'JIWA', 'JODOH', 'JUANG', 'JUARA',
        'JUBAH', 'JUDUL', 'JUJUR', 'JUMAT', 'JUMLAH', 'JURUS', 'KABAR', 'KABEL',
        'KABIN', 'KABUT', 'KACA', 'KACANG', 'KADAL', 'KADAR', 'KADO', 'KAGUM',
        'KAIN', 'KAKAK', 'KAKI', 'KALAU', 'KALBU', 'KALI', 'KALIM', 'KAMAR',
        'KAMIS', 'KAMPU', 'KAMUS', 'KANAL', 'KANAN', 'KANC', 'KANDU', 'KANGG',
        'KANTOR', 'KAPAL', 'KAPAS', 'KAPUR', 'KARAP', 'KARET', 'KARGO', 'KARIR',
        'KARTA', 'KARTU', 'KARYA', 'KASAR', 'KASIH', 'KASIR', 'KASUS', 'KATAK',
        'KAWAN', 'KAWAT', 'KAYUH', 'KAYU', 'KEBUN', 'KECAP', 'KECIL', 'KEDAI',
        'KEJAR', 'KEJUT', 'KELAP', 'KELAS', 'KELOR', 'KEMAH', 'KENAL', 'KENYANG',
        'KEPALA', 'KERAS', 'KERBA', 'KERJA', 'KERTA', 'KERUH', 'KESAL', 'KETAT',
        'KETUR', 'KILAS', 'KILAT', 'KIMIA', 'KIPAS', 'KIRIM', 'KISAH', 'KITAB',
        'KLAIM', 'KOLAM', 'KOMIK', 'KOMIS', 'KOMPA', 'KORAN', 'KORAL', 'KOREK',
        'KORSA', 'KOTAK', 'KOTOR', 'KREAS', 'KRISI', 'KUALI', 'KUBUR', 'KUCIN',
        'KUDUS', 'KUKIS', 'KULIT', 'KUMIS', 'KUNCI', 'KUNIN', 'KUPAS', 'KURSI',
        'KURUS', 'KUTUB', 'KUTUK', 'LABA', 'LABUH', 'LABUR', 'LADAN', 'LAGU',
        'LAHIR', 'LAIN', 'LAJUR', 'LALAP', 'LALAT', 'LALUI', 'LAMAN', 'LAMAR',
        'LAMBA', 'LAMPU', 'LANCI', 'LANDA', 'LANGI', 'LANJU', 'LANTA', 'LAPAR',
        'LAPIS', 'LAPOR', 'LARAS', 'LARAT', 'LARI', 'LARIS', 'LARUT', 'LATAR',
        'LAWAN', 'LAYAK', 'LAYAN', 'LAYAR', 'LEBAH', 'LEBAR', 'LEBIH', 'LEHER',
        'LEMAH', 'LEMAK', 'LEMAR', 'LEMON', 'LENSA', 'LEPAS', 'LEPIS', 'LEREN',
        'LETUR', 'LEWAT', 'LEZAT', 'LIAR', 'LIBUR', 'LIDAH', 'LILIN', 'LIPAT',
        'LITER', 'LOBIS', 'LOGAM', 'LOGIK', 'LOKAL', 'LOMBA', 'LONTAR', 'LUAS',
        'LUBUK', 'LULUS', 'LUMBA', 'LUMPUR', 'LUNAS', 'LURUS', 'LUSIN', 'MACAN',
        'MADU', 'MAHAL', 'MAHIR', 'MAIN', 'MAKAN', 'MAKAM', 'MAKIN', 'MAKMU',
        'MAKNA', 'MALAM', 'MALAS', 'MALU', 'MAMPU', 'MANIS', 'MANJA', 'MAPAN',
        'MARAH', 'MARET', 'MARIN', 'MASA', 'MASAK', 'MASIH', 'MASUK', 'MATA',
        'MATEM', 'MATER', 'MAWAR', 'MEDAL', 'MEDAN', 'MEDIA', 'MEKAR', 'MELAT',
        'MELON', 'MENAR', 'MENIT', 'MENUR', 'MERAH', 'MEREK', 'MERIA', 'MESIN',
        'MESKI', 'METRO', 'MEWAH', 'MIMPI', 'MINAT', 'MINUM', 'MINYAK', 'MIRIP',
        'MISAL', 'MISIK', 'MOBIL', 'MODAL', 'MODEL', 'MODER', 'MODUL', 'MOGOK',
        'MOHON', 'MONIT', 'MORAL', 'MOTIF', 'MOTOR', 'MUDAH', 'MUDIK', 'MUJUR',
        'MUKA', 'MULIA', 'MULUT', 'MURAH', 'MURID', 'MUSIK', 'MUSIM', 'MUSUH',
        'MUTU', 'NAFAS', 'NAIK', 'NAKAL', 'NALAR', 'NAMA', 'NANAS', 'NAPAS',
        'NASIB', 'NASIO', 'NATAL', 'NAUNG', 'NEKAD', 'NENEK', 'NETRA', 'NIAGA',
        'NIAT', 'NIKAH', 'NIKMA', 'NILAI', 'NOMOR', 'NONTON', 'NOVEL', 'NYALA',
        'NYAMAN', 'NYATA', 'NYANY', 'OBAT', 'OBJEK', 'OMBAK', 'ONTA', 'OPERA',
        'ORANG', 'ORGAN', 'OTAK', 'PACAR', 'PADAT', 'PAGAR', 'PAGI', 'PAHAM',
        'PAHIT', 'PAJAK', 'PAKAI', 'PAKET', 'PALSU', 'PALU', 'PAMER', 'PAMIT',
        'PANAS', 'PANCI', 'PANDU', 'PANEN', 'PANGG', 'PANTA', 'PAPAN', 'PARAS',
        'PARIS', 'PARUT', 'PASAR', 'PASIF', 'PASIR', 'PASTI', 'PATAH', 'PATRI',
        'PATUH', 'PATUN', 'PAUS', 'PAWAI', 'PAYUN', 'PECAH', 'PEDAL', 'PEDAS',
        'PEGAS', 'PEJAL', 'PELAN', 'PELAT', 'PELIK', 'PELOR', 'PELUK', 'PENDE',
        'PENSI', 'PERAK', 'PERAN', 'PERGI', 'PERLU', 'PERUT', 'PESAN', 'PESTA',
        'PETIR', 'PIANO', 'PIDAT', 'PIKIR', 'PILAR', 'PILIH', 'PINAS', 'PINDA',
        'PINGG', 'PINTU', 'PIPA', 'PIRAN', 'PISAH', 'PISAU', 'PITA', 'PLAST',
        'PLAZA', 'POHON', 'POKOK', 'POLIS', 'POMPA', 'PORSI', 'POSIS', 'POTON',
        'PREMI', 'PRIA', 'PRIMA', 'PRODU', 'PROSA', 'PUASA', 'PUAS', 'PUCUK',
        'PUDAR', 'PUDIN', 'PUISI', 'PUKUL', 'PULAU', 'PULIH', 'PULIS', 'PUNCA',
        'PUNYA', 'PUPUK', 'PURBA', 'PUSAT', 'PUSAR', 'PUTAR', 'PUTIH', 'PUTRA',
        'PUTRI', 'RABU', 'RACUN', 'RADAR', 'RADIO', 'RAGAM', 'RAGU', 'RAKUS',
        'RAKIT', 'RAMAI', 'RAMBA', 'RAMUT', 'RANC', 'RANTA', 'RAPAT', 'RAPAT',
        'RAPUH', 'RASA', 'RASIO', 'RATAS', 'RAWA', 'RAWAT', 'RAYA', 'RAYON',
        'REBAH', 'REBUT', 'REDA', 'REDAM', 'REDUK', 'REKAN', 'REKOR', 'RELAS',
        'REMAH', 'REMAJ', 'RENDAH', 'RESEP', 'RESMI', 'RETUR', 'RIANG', 'RIBUT',
        'RINDU', 'RINTI', 'RISIK', 'ROBEK', 'ROBOT', 'RODA', 'ROKOK', 'ROMAN',
        'RONDA', 'ROTAN', 'ROTI', 'RUANG', 'RUBAH', 'RUKUN', 'RUMAH', 'RUMPU',
        'RUMUS', 'RUNTU', 'RUPA', 'RUSAK', 'RUTIN', 'SAAT', 'SABAR', 'SABTU',
        'SABUK', 'SABUN', 'SADAR', 'SAGU', 'SAHAB', 'SAHAM', 'SAING', 'SAKIT',
        'SAKSI', 'SALAM', 'SALDO', 'SALEH', 'SALJU', 'SALUR', 'SAMA', 'SAMAN',
        'SAMAR', 'SAMBO', 'SAMPA', 'SANTA', 'SAPU', 'SARAN', 'SARAP', 'SARIN',
        'SATE', 'SATU', 'SAUDI', 'SAUNA', 'SAWAH', 'SAYAP', 'SAYUR', 'SEBAB',
        'SEBAR', 'SEBUT', 'SEDAP', 'SEDIA', 'SEDIH', 'SEGAR', 'SEHAT', 'SEJAT',
        'SEKOL', 'SELAM', 'SELAT', 'SELEP', 'SEMEN', 'SEMOT', 'SEMUA', 'SENAM',
        'SENAT', 'SENDI', 'SENIN', 'SENJA', 'SENTU', 'SENYU', 'SEPAK', 'SERAM',
        'SERBA', 'SERBI', 'SERIG', 'SERTA', 'SETIA', 'SETIR', 'SETUJ', 'SEWA',
        'SIANG', 'SIAP', 'SIAPA', 'SIFAT', 'SIHIR', 'SIKAP', 'SIKAT', 'SILAP',
        'SILAT', 'SINAR', 'SINGA', 'SIRAM', 'SIRUP', 'SISWA', 'SITUS', 'SKALA',
        'SKENI', 'SOBAT', 'SODA', 'SOLUS', 'SOPAN', 'SOPIR', 'SOROT', 'SOSIA',
        'STAF', 'SUAMI', 'SUARA', 'SUBUH', 'SUBU', 'SUBUR', 'SUDAH', 'SUDUT',
        'SUKMA', 'SUKSES', 'SULAM', 'SULIT', 'SULUH', 'SUMBU', 'SUMPA', 'SUNGA',
        'SUNYI', 'SUPIR', 'SURAT', 'SURAU', 'SURGA', 'SURUH', 'SUSAH', 'SUSUK',
        'SUSUN', 'SUSUR', 'SUSU', 'SUTRA', 'SYAFA', 'SYAIR', 'SYARAT', 'TABEL',
        'TABIR', 'TABUH', 'TABUR', 'TAHUN', 'TAJAM', 'TAJUR', 'TAKUT', 'TALAN',
        'TAMAN', 'TAMBA', 'TAMIL', 'TAMPA', 'TAMPU', 'TANAH', 'TANDA', 'TANGG',
        'TANGK', 'TANYA', 'TAPIS', 'TARIK', 'TARUH', 'TASIK', 'TAWA', 'TAWAR',
        'TEBAL', 'TEBAS', 'TEBU', 'TEGAK', 'TEGAS', 'TEGUH', 'TEGUR', 'TEKAD',
        'TEKAN', 'TEKUN', 'TELAN', 'TELOR', 'TELUK', 'TELUR', 'TEMAN', 'TEMPA',
        'TEMPO', 'TEMPU', 'TENAG', 'TENANG', 'TENDA', 'TENGA', 'TENTU', 'TEPAT',
        'TEPI', 'TEPUK', 'TERAS', 'TERBA', 'TERBU', 'TERI', 'TERIK', 'TERIM',
        'TERNA', 'TERTI', 'TERUS', 'TETAP', 'TETES', 'TIANG', 'TIDUR', 'TIKUS',
        'TIMUR', 'TINDI', 'TINGG', 'TINTA', 'TIPIS', 'TITIK', 'TIUP', 'TOKOH',
        'TOILET', 'TOMAT', 'TONGG', 'TOPI', 'TOTAL', 'TUGAS', 'TUHAN', 'TUJUH',
        'TUKAR', 'TUKUL', 'TULANG', 'TULIS', 'TULUS', 'TUMBU', 'TUMIS', 'TUMPA',
        'TUNAS', 'TUNGG', 'TUTUP', 'TUTUR', 'UBAH', 'UDANG', 'UDARA', 'UJIAN',
        'UKUR', 'ULANG', 'ULAR', 'UMAT', 'UMBI', 'UMUR', 'UNDAN', 'UNSUR',
        'UNTUK', 'UPAYA', 'URBAN', 'URUT', 'USAHA', 'USIA', 'USIR', 'UTAMA',
        'UTARA', 'VIDEO', 'VIRAL', 'VIRUS', 'VOKAL', 'WADAH', 'WAJAR', 'WAJAH',
        'WAJIB', 'WAKIL', 'WAKTU', 'WALAU', 'WANGI', 'WARIS', 'WARNA', 'WARTE',
        'WATAK', 'WORTEL', 'YAKIN', 'ZAMAN', 'ZAKAT', 'ZAMBR',
    ];

    /**
     * Normalize string to standard 5-letter uppercase.
     */
    public static function normalize(string $word): string
    {
        return strtoupper(trim($word));
    }

    /**
     * Get a random 5-letter target secret word.
     */
    public static function getRandomTargetWord(): string
    {
        $words = array_filter(self::$targetWords, fn ($w) => strlen($w) === 5);

        return $words[array_rand($words)];
    }

    /**
     * Check if a 5-letter guess exists in valid dictionary.
     */
    public static function isValidWord(string $word): bool
    {
        $normalized = self::normalize($word);
        if (strlen($normalized) !== 5) {
            return false;
        }

        return in_array($normalized, self::$targetWords, true) || in_array($normalized, self::$validWords, true);
    }
}
