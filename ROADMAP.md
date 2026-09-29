# svgforge — Fork Roadmap

> Bu repo, [KodYazicam/svgforge](https://github.com/KodYazicam/svgforge) projesinin fork'udur.
> KYAL-1.0 lisansı gereği tüm türev çalışmalarda orijinal yazara atıf zorunludur:
> **Author: Batuhan (KodYazicam) — Project: svgforge — Source: https://github.com/KodYazicam/svgforge**

## Mevcut Durum (v2.5.0 baseline)

- 32 kart tipi (`src/cards/*.ts`), her kart tek dosya, saf fonksiyon → SVG string
- 30 tema (`src/escape.ts` içinde `THEMES`)
- CLI (`src/cli.ts`) + kütüphane API'si (`src/index.ts`) + manifest render (`src/render.ts`)
- Node 22+, sıfır runtime bağımlılığı, ağ yok
- 24 test (tek dosya: `tests/svgforge.test.ts`), CI (build+test) ve release workflow mevcut
- npm'de **yayınlı değil** (`private: true`, isim `@kodyazicam/svgforge`)

## Faz 0 — Fork Altyapısı ✅

- [x] Fork: `KaramelliS/svgforge`, `upstream` remote tanımlı
- [x] Baseline doğrulama: `npm ci`, `npm run build`, `npm test` (24/24 ✓)
- [x] Bu roadmap dosyası
- [ ] Fork'ta branch koruması + CI'ın fork Actions'ta yeşil olduğunu doğrula
- [ ] `package.json`'a kendi copyright satırını **orijinalini silmeden** ekle

## Faz 1 — Sağlamlaştırma (kalite temeli)

- [ ] Testleri kart bazında böl: `tests/cards/<tip>.test.ts` — her kart için snapshot + kenar durumları (boş item, aşım, özel karakter escaping, clamp 0–100)
- [ ] Görsel regresyon: üretilen SVG'leri `examples/` ile byte/diff karşılaştıran test
- [ ] Lint + format: Biome (veya ESLint+Prettier) ve `npm run lint` CI'a ekle
- [ ] Kapsam raporu (vitest `--coverage`), hedef: %85+
- [ ] Hata mesajlarını standartlaştır (tek `CliError` sınıfı, exit kodları tablosu)

## Faz 2 — npm Yayını

- [ ] Paket adını değiştir: `@karamellis/svgforge` (orijinal isim upstream'e ait), `private: false`
- [ ] LICENSE/README'de KYAL-1.0 atfını koru + kendi katkı notunu ekle
- [ ] `release.yml`'i fork'a uyarla: npm provenance (`--provenance`), `NPM_TOKEN` secret
- [ ] Changesets veya `semantic-release` ile sürümleme
- [ ] İlk sürüm: `2.5.0-fork.0` pre-release → stabil `1.0.0` (kendi semver'ın)

## Faz 3 — Yeni Kartlar ve Özellikler

Yeni kart eklemek: `src/cards/<tip>.ts` + `render.ts` dispatch + `cli.ts` flag'leri + `index.ts` export + test + `ALL-SVG-FORMS.md`.

- [ ] `typing` — daktilo animasyonlu metin (readme-typing-svg alternatifi, SMIL ile)
- [ ] `heatmap` — takvim ısı haritası (contrib'in genelleştirilmiş hâli, gerçek veri girişi)
- [ ] `table` — markdown-benzeri tablo kartı
- [ ] `repo-langs` — dil dağılım çubuğu (github-linguist tarzı yatay bar)
- [ ] `streak` — katkı serisi (current/longest streak)
- [ ] Özel tema dosyası: `--theme-file theme.json` (22 gömülü temaya ek)
- [ ] Tüm kartlara `--animate` / `--width` / `--height` tutarlılığı denetimi
- [ ] `code` kartına daha fazla dil vurgusu (rust, go, json, yaml)

## Faz 4 — Geliştirici Deneyimi (DX)

- [ ] `svgforge init` — interaktif `svgforge.json` manifest oluşturucu
- [ ] `svgforge render --watch` — dosya değişince yeniden üret
- [ ] `svgforge preview` — lokal sunucuda kart galerisi önizlemesi
- [ ] Shell completion (bash/zsh/fish) üretimi
- [ ] `--help` çıktısına kart başına örnek komut

## Faz 5 — Ekosistem

- [ ] **GitHub Action**: `uses: KaramelliS/svgforge-action@v1` — manifest'ten SVG üretip commit'leyen action (scheduled: günlük streak/counter güncelleme)
- [ ] Web playground (statik, tek sayfa): flag'leri formdan doldur → canlı SVG önizleme → komutu kopyala
- [ ] VS Code extension (opsiyonel): komut paletinden kart ekle
- [ ] Şablon galerisi: `templates/` altında hazır manifest koleksiyonları (profil README, proje README, portfolio)

## Faz 6 — Upstream Senkron Stratejisi

- [ ] Her ay `git fetch upstream && git merge upstream/main` kontrolü
- [ ] Genel faydalı düzeltmeleri upstream'e PR olarak gönder (iyi fork vatandaşlığı)
- [ ] Fork'a özel özellikleri `fork/` prefix'li branch'lerde geliştir, `main`'i upstream'e yakın tut
- [ ] CHANGELOG'da fork değişikliklerini ayrı başlıkta tut

## Öncelik Sırası (önerilen)

1. Faz 1 (test + lint) — her şeyin temeli
2. Faz 2 (npm yayını) — kütüphaneyi kullanılabilir kılar
3. Faz 3'ten `typing` + özel tema dosyası — en görünür fark
4. Faz 5 GitHub Action — viral büyüme kanalı
5. Geri kalanlar ihtiyaca göre

---

*Atıf: Bu proje [KodYazicam/svgforge](https://github.com/KodYazicam/svgforge) üzerine inşa edilmiştir — Batuhan (KodYazicam).*
