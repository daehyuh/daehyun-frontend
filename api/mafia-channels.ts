import type {VercelRequest, VercelResponse} from '@vercel/node';

const CHANNEL_SOURCE_URL = 'https://mafia42.com/php/channels/channel_ko.php';

const setCorsHeaders = (res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({success: false, message: 'Method Not Allowed'});
    }

    try {
        const upstreamResponse = await fetch(CHANNEL_SOURCE_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'daehyundotcom-channel-proxy'
            },
            cache: 'no-store'
        });

        if (!upstreamResponse.ok) {
            return res.status(upstreamResponse.status).json({
                success: false,
                message: 'Upstream request failed'
            });
        }

        const data = await upstreamResponse.json();
        return res.status(200).json({success: true, data});
    } catch (error) {
        console.error('[mafia-channels proxy]', error);
        return res.status(500).json({success: false, message: 'Failed to fetch channel data'});
    }
}
