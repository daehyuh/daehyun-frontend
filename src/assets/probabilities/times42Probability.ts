import json150 from "./202642타임즈/150.json";
import json750 from "./202642타임즈/750.json";
import json2500R from "./202642타임즈/2500R.json";
import jsonLegend from "./202642타임즈/Legend.json";
import GradeProbability from "@/constant/GradeProbability";
import JsonProbability from "@/constant/JsonProbability";

const times42Probability: GradeProbability = {
    "150": json150 as JsonProbability,
    "750": json750 as JsonProbability,
    "2500R": json2500R as JsonProbability,
    "Legend": jsonLegend as JsonProbability
};

export default times42Probability;
