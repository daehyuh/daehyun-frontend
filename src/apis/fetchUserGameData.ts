import fetchAPI from "./base/fetchAPI";

const fetchUserGameData = async (nickname: string) => {
    const encodedNickname = encodeURIComponent(nickname);
    return fetchAPI<UserGameData>(`records/search?nickname=${encodedNickname}`)
        .then(({
                   todaygames,
                   today_games,
                   current_lose_count,
                   current_win_count,
                   past_lose_count,
                   past_win_count,
                   isTodayLimit,
                   ...result
               }): UserGameData => {
            const parsedTodayGames = Number(today_games ?? todaygames);
            const normalizedTodayGames = Number.isFinite(parsedTodayGames) ? parsedTodayGames : null;

            return {
                today_games: normalizedTodayGames,
                todaygames,
                current_lose_count,
                current_win_count,
                past_lose_count,
                past_win_count,
                isTodayLimit,
                ...result
            };
        });
}

export default fetchUserGameData
