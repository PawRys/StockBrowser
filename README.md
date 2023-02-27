# StockBrowser

Program służy do przeglądania produktów, kalkulowania cen oraz tworzenia spisu z natury.
Celem powstania było rozszerzenie dostępu do stanów magazynowych na urządzenia mobilne,
ponieważ główny program magazynowy nie posiadał takiej funkcji.

### Z czego jestem najbardziej zadowolony?
Może nie są to niewiadomo jakie ficzery, ale jak zadziałało to była radocha :)

- ewaluacja stringu z zapisem matematycznym (tylko podstawowe działania z nawiasami, nie jest to po prostu eval())
- customowo tworzone filtry
- wyszukiwanie tekstowe z uproszczonym regex
  - . kropka to dowolny znak
  - | pipe to logiczny lub
  - = na początku słowa wyszukuje całe wyrazy
- umożliwia udostępnianie danych w chmurze

Żeby sprawdzić działanie programu należy nakarmić go danymi z pliku [stany.txt](https://github.com/PawRys/StockBrowser/blob/master/stany.txt) w zakładce "załaduj" w programie. Przesyłanie danych przez schowek jest jedyną znaną mi metodą komunikacji między programem magazynowem, a moją apką.
Przykładowe dane nie zawierają cen towarów bo nie wolno :)

https://pawrys.github.io/StockBrowser/
