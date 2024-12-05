import fetchAPI from "./base/fetchAPI";

const fetchUserGameData = (nickname: string, completion: (userGameData: UserGameData) => void) => {
    fetchAPI<UserGameData>(`user/?user=${nickname}`)
        .then(({
                   todaygames,
                   today_games,
                   ...result
               }): UserGameData => ({
            today_games: !isNaN(Number(todaygames)) ? Number(todaygames) : null,
            todaygames: todaygames,
            ...result
        }))
        .then(completion)
}

export default fetchUserGameData