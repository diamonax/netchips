# API

The API exports the function ```startServer(port: number)``` to start up the API server at a given port. This server only expects HTTP POST requests. The available endpoints have the same names as the module functions themselves. The argument for these functions needs to be passed as a JSON object in the body.

The API consists of 3 different modules: **search**, **subtitles** and **videos**.

## Search

The **search** module provides functions to search for movies and series.

### Types

```
type Suggestion = {
    image: string    // a poster image URL
    title: string    // the title
    url:   string    // a URL pointing to further information
    year:  number    // the release year
}
```
Represents a search suggestion for a movie or series.

---

```
type Information = {
    description: string    // a short description
    duration:    number    // the duration in minutes
    genres:      string[]  // a list of genres
    image:       string    // a poster image URL
    rating:      number    // a rating between 0 and 10
    title:       string    // the title
    year:        number    // the release year
}
```
Represents information about a movie or series.

---

```
type MovieInformation = Information
```
Represents information about a movie.

---

```
type SeriesInformation = Information & {
    seasons: {
    	season: number	    // the season number
        url:    string      // a URL pointing to further information
    }[]
}
```
Represents information about a series.

---

```
type SeasonEpisode = {
    airdate:     string    // the airdate
    description: string    // a short description
    episode:     number    // the episode number
    image:       string    // a poster image URL
    title:       string    // the title
}
```
Represents information about an episode from a season of a series.


### Functions


```
function getPopularMovies(): Promise<Suggestion[]>
```
Returns a list of popular movie suggestions. Throws an error if it is unable to do so.

---

```
function getPopularSeries(): Promise<Suggestion[]>
```
Returns a list of popular series suggestions. Throws an error if it is unable to do so.

---

```
function searchMovie({ query: string }): Promise<Suggestion[]>
```
Returns a list of movie suggestions for the given query. Throws an error if it is unable to do so.

---

```
function searchSeries({ query: string }): Promise<Suggestion[]>
```
Returns a list of series suggestions for the given query. Throws an error if it is unable to do so.

---

```
function getMovieInformation({ url: string }): Promise<MovieInformation>
```
Returns further information for a movie via the given URL. Throws an error if it is unable to do so.

---

```
function getSeriesInformation({ url: string }): Promise<SeriesInformation>
```
Returns further information for a series via the given URL. Throws an error if it is unable to do so.

---

```
function getSeasonEpisodes({ url: string }): Promise<SeasonEpisode[]>
```
Returns a list of aired episodes from a season of a series via the given URL. Throws an error if it is unable to do so.


## Subtitles

The **subtitles** module provides functions to retrieve dutch subtitles for a movie or series episode.

### Types

```
type Subtitles = string
```
Represents the subtitles for a movie or series in SRT format.

### Functions

```
function getMovieSubtitles({ title: string, year: number }): Promise<Subtitles>
```
Returns the subtitles for a movie represented by its title and year of release. Throws an error if it is unable to do so.

---

```
function getSeriesSubtitles({ title: string, season: number, episode: number }): Promise<Subtitles>
```
Returns the subtitles for a series episode represented by the series title, the season number and the episode number. Throws an error if it is unable to do so.

## Videos

The **videos** module provides functions to retrieve video resources for a movie or series episode. A resource is either a magnet link or a URL to an MP4, M3U8 or torrent file.

### Types

```
type UrlResource = string
```
Represents a direct URL to either an MP4 or M3U8 file.

---

```
type TorrentResource = {
    quality: "480p" | "720p" | "1080p",
    url:     string,
}
```
Represents information about a torrent file, i.e. the quality of the video and a magnet link or direct URL to a torrent file.


### Functions

```
function getMovieUrls({ title: string, year: number }): Promise<UrlResource[]>
```
Returns a list of URL resources for a movie represented by its title and year of release. Throws an error if it is unable to do so.

---

```
function getSeriesUrls({ title: string, season: number, episode: number }): Promise<UrlResource[]>
```
Returns a list of URL resources for a series episode represented by the series title, the season number and the episode number. Throws an error if it is unable to do so.

---

```
function getMovieTorrents({ title: string, year: number }): Promise<TorrentResource[]>
```
Returns a list of torrent resources for a movie represented by its title and year of release. Throws an error if it is unable to do so.

---

```
function getSeriesTorrents({ title: string, season: number, episode: number }): Promise<TorrentResource[]>
```
Returns a list of torrent resources for a series episode represented by the series title, the season number and the episode number. Throws an error if it is unable to do so.
