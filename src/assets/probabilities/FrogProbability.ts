import json150 from './2025개구리/150.json';
import json750 from './2025개구리/750.json';
import json2500R from './2025개구리/2500R.json';
import jsonLegend from './2025개구리/Legend.json';
import GradeProbability from "@/constant/GradeProbability";
import JsonProbability from "@/constant/JsonProbability";


const frogProbability: GradeProbability = {
    '150': json150 as JsonProbability,
    '750': json750 as JsonProbability,
    '2500R': json2500R as JsonProbability,
    'Legend': jsonLegend as JsonProbability
}

export default frogProbability;