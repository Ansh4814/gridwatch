def generate_explanation(neighborhood: dict, risk_data: dict, temp_f: float, subsidy: float = 0, moratorium: bool = False) -> str:
    name = neighborhood["name"]
    income = neighborhood["median_income"]
    poverty = neighborhood["poverty_rate"] * 100
    housing = neighborhood["old_housing_pct"] * 100
    score = risk_data["risk_score"]
    level = risk_data["risk_level"]
    breakdown = risk_data["breakdown"]

    # Sentence 1: Main driver
    if breakdown["income_factor"] >= breakdown["poverty_factor"]:
        s1 = f"{name} carries a {level.lower()} energy risk score of {score}/100, driven primarily by a median household income of ${income:,} — well below the threshold needed to absorb rising utility costs without sacrifice."
    else:
        s1 = f"{name} carries a {level.lower()} energy risk score of {score}/100, driven primarily by a poverty rate of {poverty:.1f}% — meaning roughly 1 in {max(2,int(100/poverty))} households lacks adequate income to reliably pay utility bills."

    # Sentence 2: Weather + compounding (no housing repeat)
    if temp_f > 90:
        s2 = f"Extreme heat at {temp_f:.0f}°F is spiking cooling costs, compounding financial pressure on households already spending a disproportionate share of income on utilities."
    elif temp_f < 20:
        s2 = f"Dangerous cold at {temp_f:.0f}°F is dramatically increasing heating demand — residents in older, energy-inefficient homes face some of the highest utility burdens in the city."
    elif temp_f < 32:
        s2 = f"Freezing temperatures at {temp_f:.0f}°F are elevating heating costs precisely when low-income households have the least financial flexibility to absorb them."
    elif temp_f < 45:
        s2 = f"Cold weather at {temp_f:.0f}°F is adding heating pressure, and with {housing:.0f}% of local housing stock being older and poorly insulated, energy bills run higher than in newer neighborhoods."
    else:
        s2 = f"While current temperatures at {temp_f:.0f}°F provide some relief, {housing:.0f}% of housing in {name} is older stock with poor insulation — meaning even moderate weather translates to above-average utility costs for residents."

    # Sentence 3: Intervention based on policy state
    if subsidy > 0 and moratorium:
        s3 = f"Current active subsidies and the utility moratorium are together reducing estimated risk significantly — sustained policy support is critical to prevent disconnections once these measures expire."
    elif moratorium:
        s3 = f"The active utility moratorium is providing meaningful short-term protection, but without income-based subsidies, households in {name} remain vulnerable once the moratorium lifts."
    elif subsidy > 0:
        s3 = f"Active energy subsidies are helping reduce risk, but adding a utility moratorium during extreme weather events would provide the strongest additional protection for {name} residents."
    elif score >= 70:
        s3 = f"Immediate intervention is recommended — targeted LIHEAP energy assistance and a temporary utility moratorium would have the highest impact in preventing disconnections in {name}."
    elif score >= 50:
        s3 = f"Proactive LIHEAP enrollment outreach and weatherization grants for older housing would most effectively reduce energy insecurity in {name} before the next weather extreme."
    else:
        s3 = f"Risk is currently manageable, but monitoring during winter months and ensuring LIHEAP awareness among lower-income residents in {name} would help maintain this stability."

    return f"{s1} {s2} {s3}"
