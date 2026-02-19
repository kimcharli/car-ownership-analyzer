mod engine;

use wasm_bindgen::prelude::*;
use crate::engine::{CostParams, compute_scenario};

// Expose the function to JS
#[wasm_bindgen]
pub fn compute_scenario_wasm(params_val: JsValue, scenario_key: &str) -> Result<JsValue, JsValue> {
    // Enable panic hook for better debugging
    console_error_panic_hook::set_once();

    let params: CostParams = serde_wasm_bindgen::from_value(params_val)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    match compute_scenario(&params, scenario_key) {
        Ok(result) => {
            let js_result = serde_wasm_bindgen::to_value(&result)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;
            Ok(js_result)
        },
        Err(err) => Err(JsValue::from_str(&err)),
    }
}

#[wasm_bindgen]
pub fn init_debug() {
    console_error_panic_hook::set_once();
}
