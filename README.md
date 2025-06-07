# Wprowadzenie

Gra **Kółko i krzyżyk** to przeglądarkowa implementacja klasycznej gry
strategicznej, znanej również jako *tic-tac-toe*. Aplikacja możliwia
rozgrywkę w dwóch trybach: klasycznym oraz kolumnowym, z możliwością
dostosowania ustawień gry, takich jak liczba graczy, rozmiar planszy czy
warunek zwycięstwa. Gra wspiera zarówno rozgrywkę jednoosobową przeciwko
botom, jak i wieloosobową między żywymi graczami.

Celem projektu było stworzenie intuicyjnej, responsywnej gry z prostym
interfejsem użytkownika, która pozwala na elastyczną konfigurację
rozgrywki oraz zapewnia różnorodność dzięki botom o różnym poziomie
trudności.

# Opis struktury projektu

Projekt jest zorganizowany w kilka katalogów i kluczowych plików. Każdy
z nich pełni swoją rolę. Poniżej przedstawiono strukturę projektu:

- **css/**: Przechowuje pliki stylów.

    - *game.css:* Stylizacja planszy gry i elementów z nią związanych.
    - *globalVariables.css:* Globalne zmienne CSS i definicje czcionek.
    - *menu.css:* Stylizacja strony menu.
    - *style.css:* Stylizacja ogólna, w tym nagłówek i dialogi.

- **fonts/**: Folder z czcionkami (Fredoka One, Noto Sans).

- **html/**: Zawiera pliki HTML definiujące strukturę podstron.

    - *game.html:* Plik HTML dla głównego widoku gry, zawierający planszę
      i elementy interfejsu.

- **img/**: Folder z ikonami i grafikami (np. logo, ikony przycisków).

- **js/**: Zawiera moduły JavaScript odpowiadające za funkcjonalność strony.

    - *bots.js:* Implementacja algorytmów botów (łatwy, średni, minimax).
    - *game.js:* Logika rozgrywki, w tym generowanie planszy, ruchy graczy
      i botów.
    - *helper.js:* Funkcje pomocnicze do obsługi zdarzeń.
    - *menu.js:* Logika menu, w tym obsługa formularza ustawień gry.
    - *script.js:* Logika ogólna gry, w tym obsługa dźwięku i dialogów
      ustawień.

- **sfx/**: Przechowuje pliki dźwiękowe.

    - *Girl from Petaluma.mp3:* Muzyka, która jest odtwarzana podczas
      myślenia bota minimax.

- **Katalog główny**:

    - *index.html:* Główny plik HTML dla strony startowej z menu ustawień
      gry.

# Zastosowane technologie

- **HTML5**: Struktura strony, semantyczne znaczniki (*\<header\>*,
  *\<main\>*, *\<dialog\>*).
- **CSS3**: Stylizacja z wykorzystaniem Flexbox, Grid, zmiennych CSS
  (*--variable*), importowania stylów (*@import*), oraz responsywnych
  jednostek (*vw*, *vh*, *vmin*).
- **JavaScript (ES6)**: Logika gry, w tym moduły ES6, obsługa zdarzeń,
  localStorage do zapisywania ustawień, oraz algorytm minimax dla
  trudnego bota.
- **Czcionki**: Fredoka One (tytuły), Noto Sans (treść).
- **Lokalne zasoby**: Ikony i muzyka (np. *elevator-music*)
  przechowywane lokalnie.

# Opis funkcji użytkownika

Gra oferuje następujące funkcje dla użytkownika:

## Rozgrywka

- **Tryby gry**:

    - Klasyczny: Gracze umieszczają symbole w dowolnym miejscu na planszy.
    - Kolumnowy: Symbole można umieszczać tylko na dole kolumny lub na
      istniejących symbolach, co przypomina grę w kółko i krzyżyk w stylu
      „Connect Four”.

- **Gracze**: Obsługa od 2 do 4 graczy, z możliwością wyboru między żywymi
  graczami a botami (łatwy, średni, trudny).

- **Konfiguracja planszy**: Użytkownik może ustawić liczbę wierszy, kolumn
  oraz warunek zwycięstwa (liczbę symboli w linii).

- **Restart gry**: Przycisk restartu pozwala na ponowne rozpoczęcie gry z
  zachowaniem ustawień.

## Interfejs użytkownika

- **Nagłówek**: Zawiera logo, przycisk powrotu, ustawienia i sterowanie
  dźwiękiem.
- **Plansza gry**: Dynamicznie generowana siatka z polami, które reagują na
  kliknięcia i najechanie myszą.
- **Dialogi**: Okna dialogowe dla ustawień i źródeł, z możliwością
  zamknięcia.
- **Dźwięk**: Odtwarzanie muzyki w tle (tzw. „elevator music”) z regulacją
  głośności przez suwak.

## Boty

- **Łatwy bot**: Losowo umieszcza symbole na planszy.
- **Średni bot**: Próbuje wygrać w jednym ruchu lub zablokować przeciwnika,
  w przeciwnym razie wykonuje ruch losowy.
- **Trudny bot (Minimax)**: Wykorzystuje algorytm minimax z obcinaniem
  alfa-beta, zapewniając optymalne ruchy na planszy 3x3 w trybie
  klasycznym. Na większych planszach może działać wolniej.

## Ustawienia

- **Zapisywanie ustawień**: Ustawienia gry (rozmiar planszy, tryb, gracze)
  zapisywane są w *localStorage*.
- **Ostrzeżenia**: Dynamiczne ostrzeżenia informują o potencjalnych
  problemach, np. ograniczeniach botów w trybie kolumnowym lub na dużych
  planszach.

# Instrukcja użytkownika

Poniżej przedstawiono instrukcję korzystania z gry, wraz ze zrzutami
ekranu.

## Krok 1: Uruchomienie gry

1.  Otwórz stronę [**Tic Tac
    Broi**](https://tic-tac-broi.great-site.net/) w przeglądarce.
2.  Zobaczysz ekran menu z formularzem ustawień gry.

## Krok 2: Konfiguracja gry

1.  W sekcji „Lista graczy”:

    - Kliknij **+** (Dodaj gracza) lub **−** (Usuń gracza), aby zmienić
      liczbę graczy (2-4).
    - Wybierz typ dla każdego gracza (Gracz, Łatwy bot, Średni bot,
      Trudny bot (Minimax)).

2.  Następnie ustaw:

    - Liczbę wierszy i kolumn planszy (np. 3x3).
    - Warunek zwycięstwa (np. 3 symbole w linii).
    - Tryb gry: klasyczny lub kolumnowy.

3.  Kliknij **►** (Graj), aby przejść do planszy.

## Krok 3: Rozgrywka

1.  Na ekranie gry zobaczysz planszę i komunikat o turze gracza (np.
    „Twoja kolej, ⨉!”).
2.  Kliknij pole na planszy, aby umieścić swój symbol (w trybie
    kolumnowym kliknięcie w kolumnę umieszcza symbol na dole).
3.  Jeśli gra toczy się z botami, bot wykona ruch automatycznie po
    krótkiej pauzie.
4.  Gra kończy się, gdy ktoś wygra (np. „◯ wygrywa!”) lub będzie remis
    („Nikt nie wygrywa!”).

## Krok 4: Ustawienia i dźwięk

1.  Kliknij ikonę głośnika w nagłówku, aby włączyć/wyłączyć muzykę.
2.  Kliknij ikonę ustawień, aby otworzyć dialog ustawień (np. regulacja
    głośności).

## Krok 5: Restart gry

1.  Kliknij przycisk **↻** (Restart) w
    nagłówku, aby rozpocząć nową grę z tymi samymi ustawieniami.

# Planowany rozwój aplikacji

Autor uważa projekt za zakończony i nie planuje dalszych modyfikacji.
Gra w obecnej formie spełnia wszystkie zakładane wymagania, oferując:

- Elastyczną konfigurację rozgrywki.
- Różnorodność trybów i botów.
- Responsywny i intuicyjny interfejs.
- Stabilną implementację bez znanych błędów.

Ewentualne przyszłe ulepszenia:

- **Optymalizacja minimax**: Skrócenie czasu obliczeń dla trudnego bota na
  dużych planszach poprzez lepsze obcinanie alfa-beta.
- **Lepsza obsługa trybu kolumnowego**: opracowanie algorytmów botów, aby
  lepiej radziły sobie w trybie kolumnowym.
- **Dodatkowe tryby gry**: Wprowadzenie nowych wariantów, np. ograniczenie
  czasu na ruch.
- **Lepsza responsywność na małych ekranach**: Obecnie działa, ale można
  poprawić układ.
- **Lokalizacja**: Dodanie wsparcia dla innych języków (np. angielskiego).

Na chwilę obecną brak jest planów implementacji powyższych ulepszeń,
ponieważ projekt jest uznawany za kompletny.
