import json150 from './2026_42CITY/150.json';
import json750 from './2026_42CITY/750.json';
import json2500R from './2026_42CITY/2500R.json';
import jsonLegend from './2026_42CITY/Legend.json';
import GradeProbability from "@/constant/GradeProbability";
import JsonProbability from "@/constant/JsonProbability";

const city42Probability: GradeProbability = {
    '150': json150 as JsonProbability,
    '750': json750 as JsonProbability,
    '2500R': json2500R as JsonProbability,
    'Legend': jsonLegend as JsonProbability
}

export default city42Probability;
