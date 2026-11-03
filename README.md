# El Campéon Academy, sajt

Statičan sajt (HTML + CSS + JS), bez build koraka. Spreman za GitHub Pages.

## Struktura
```
index.html          stranica (sve sekcije)
css/style.css       ceo dizajn, boje (CSS varijable), animacije, responsive
js/main.js          preloader, nav pill, mobilni meni, reveal animacije, forma
assets/logo-crest.png   logo (grb)
assets/favicon.png      ikonica taba
assets/img/             OVDE idu fotografije
```

## Fotografije
Ubacite slike u `assets/img/` sa tačno ovim imenima. Dok slika ne postoji, prikazuje se plavi placeholder.

- hero.jpg (glavna, uspravna 4:5; na mobilnom se seče na 4:3)
- o-nama.jpg (Kako je sve počelo)
- probni-trening.jpg (Hajde, zajedno da probamo)
- ocekivanja.jpg (Očekivanja na treningu)
- roditelji.jpg (Roditelji su deo tima)
- trener.jpg (uspravna 4:5, Dušan Sajdl)
- galerija-1.jpg … galerija-5.jpg (galerija-1 je najveća)

Trenutne slike su privremene, za pregled. Zamenite ih pravim fotografijama pod istim imenima.

Preporuka: širina do 1600px, kompresovano (npr. squoosh.app).

## Objava na GitHub Pages
1. Napravite novi repozitorijum na github.com.
2. Upload-ujte SADRŽAJ ovog foldera (index.html mora biti u root-u).
3. Settings → Pages → Source: "Deploy from a branch", Branch: main, folder: / (root) → Save.
4. Sajt je za minut na https://KORISNIK.github.io/REPO/

## Forma
Forma trenutno ne šalje poruke (demo). Za pravo slanje:
1. Napravite besplatan nalog na formspree.io i novu formu.
2. U index.html, na `<form id="trial-form" ...>` dodajte `action="https://formspree.io/f/VAS_ID" method="POST"`.
JS će tada stvarno poslati podatke i prikazati potvrdu.

## Za dopunu
Tekstovi u uglastim zagradama [ ... ] su placeholderi (programi, treneri, biografije).
