import fetchAPI from "./base/fetchAPI";

const fetchUserGameData = async (nickname: string) => {
    return fetchAPI<UserGameData>(`records/search?nickname=${nickname}`)
        .then(({
                   todaygames,
                   today_games,
                   current_lose_count,
                   current_win_count,
                   past_lose_count,
                   past_win_count,
                   isTodayLimit,
                   ...result
               }): UserGameData => ({
            today_games: !isNaN(Number(todaygames)) ? Number(todaygames) : null,
            todaygames: todaygames,
            current_lose_count,
            current_win_count,
            past_lose_count,
            past_win_count,
            isTodayLimit,
            ...result
        }))
}

export default fetchUserGameData