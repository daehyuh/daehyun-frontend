import fetchAPI from "./base/fetchAPI";

const fetchUserGameData = async (nickname: string) => {
    return fetchAPI<UserGameData>(`user/?user=${nickname}`)
        .then(({
                   todaygames,
                   today_games,
                   ...result
               }): UserGameData => ({
            today_games: !isNaN(Number(todaygames)) ? Number(todaygames) : null,
            todaygames: todaygames,
            ...result
        }))
}

export default fetchUserGameData