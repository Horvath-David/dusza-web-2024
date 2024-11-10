# Műküdési leírás
Amikor a felhasználó megnyitja a webalkalmazást, akkor az automatikusan leellenőrzi,
hogy azonosítva van-e, és ha szükséges akkor átirányít a bejelentkezésio oldalra, ahol a 
versenyzők akár saját profilt is létrehozhatnak.

## Versenyzői nézet
A felületre csak egy csapattagnak kell regisztrálnia, ő lesz a csapatkapitány. Sikeres
regisztráció vagy bejelentkezés után az oldalsávon található `Csapat hozzáadása` gombra
kattintva ki tudja tölteni a jelentkezési kérdőívet majd a lap alján található gombra
kattintva be tudja küldeni. Nevezés után nincs lehetőség az iskola módosítására.
Ha már korábban nevezett a csapatot akkor a `Csapat szerkesztése`
gomb jelenik meg, ahol az adatok módosítására van lehetőség. Ezen az oldalon fognak
megjelenni a csapatkapitánynak cíímzett értesítése (az szervezőktől érkező üzenetek,
illetve az eltávolítási értesítések). Új csapat regisztrálására és
az adatok módosítására csak a nevezési határidő lejárta előtt van lehetőség, útána a
szerver visszautasít minden ilyen nemű kérést.

## Szervezői nézet
Az oldalsávon a `Programozási nyelvek` gombra kattintva lehet hozzáadni és eltávolítani
a versenyzők által választhatő programozási nyelveket. Ha van olyan csapat amelyik már
korábban az eltávolítani kívánt programozási nyelvet választotta, akkor a szerver 
visszautasítja a kérést.

A `Kategóriák` gombra kattintva a versenyzők által választható kategóriákat lehet 
eltávolítani illetve létrhozni. Ha van olyan csapat amelyik már korábban az 
eltávolítani kívánt kategóriát választotta, akkor a szerver 
visszautasítja a kérést.


Az `Intézmények` menüben a résztvevő iskolák szerkesztésére, eltávolítására és hozzáadására
van lehetőség. Eltávolításkor kitörlésre kerül az iskola kapcsolattartói profilja, valamint
az összes benevezett csapat, akik az adott iskolát választották.

A `Csapatok` menüben van lehetőség a nevezett csapatok jóváhagyására, eltávolítására
valamint üzenetküldésre a csapatkapitány részére. Csapat törlésekor a rendszer 
automatikusan értesíti a csapatkapitányt, azonban a nevezési határidő vége előtt
még van lehetősége új csapatot regisztrálni. Továbbá van lehetőség elfogadási 
állapot szerint szűrni a csapatokat és exportálni az összes csapatot csv formátumban.

A `Konfiguráció` menüpontban van lehetőság a nevezési határidő módosítására valamint
az azonnali lezárásra.

A `Statisztikák` menüben megjelennek a csapatok darabszámai elfogadássi állapot, iskola,
választott programozási nyelv és választott kategória szerint.

## Iskolai nézet
Az oldalsávon az `Adatok módosítása` gombra kattintva van lehetőség az iskola adatainak
a módosítására

A `Csapatok` menüben az iskolából jelentkezett csapatok elfogadásáara illetve elutasítására
van lehetőség. Elfogadáskor szükséges feltölteni az aláírt nyomtatványt kép formátumban.
Sikeres feltöltés után a csapat automatikusan elfogadásra kerül, ezután egy szervezőnek is
el kell fogadnia. Elutasítás esetén a rendszer automatikusan értesítés küld a 
csapatkapitánynak, azonban a nevezési határidő vége előtt még van lehetősége új 
csapatot regisztrálni.

# Bővítési lehetőségek
A feladatmegoldás közben felemrült ötletként egy központi értesítési rendszer implementálása
de a határidő miatt inkább nem csak részben csináltuk meg, hogy a követelményeknek 
megfeleljen. Ez a központi értesítési még akár bővíthető lehetne egy email küldési 
rendszerrel.

    Dusza panel
    Copyright (C) 2024  ${csapatnev} team (Béla Buczkó, Dávid Horváth, Márton Vad)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.