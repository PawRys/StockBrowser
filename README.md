# StockBrowser

Program służy do przeglądania produktów, kalkulowania cen oraz tworzenia spisu z natury.
Celem powstania było rozszerzenie dostępu do stanów magazynowych na urządzenia mobilne,
ponieważ główny program magazynowy nie posiadał takiej funkcji.

### Co program robi niezwykłego (imho)?
Wszystko w tym programie zostało uszyte na miarę. Żadne z gotowych rozwiązań nie spełniało moich założeń w 100%.
- ewaluacja stringu z zapisem matematycznym (tylko podstawowe działania z nawiasami, nie jest to po prostu eval())
- customowo tworzone filtry
- wyszukiwanie tekstowe z uproszczonym regex
  - . kropka to dowolny znak
  - | pipe to logiczny lub
  - = na początku słowa wyszukuje całe wyrazy
- umożliwia udostępnianie danych w chmurze

Działanie programu można sprawdzić wklejając przykładową bazę danych z pliku [stany.txt](https://github.com/PawRys/StockBrowser/blob/master/stany.txt) w zakładce "załaduj" w programie.
Przykładowe dane nie zawierają cen towarów bo nie wolno :)

https://pawrys.github.io/StockBrowser/
