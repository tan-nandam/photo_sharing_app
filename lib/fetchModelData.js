/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns {Promise} A Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
// lib/fetchModelData.js

// lib/fetchModelData.js

function fetchModel(url) {
  return fetch(url) // Perform the GET request
    .then((response) => {
      if (!response.ok) {
        // Handle HTTP errors (non-2xx status)
        const error = new Error(response.statusText || 'HTTP Error');
        error.status = response.status;
        throw error; // Use throw instead of Promise.reject for better handling
      }
      return response.json(); // Parse the response body as JSON
    })
    .then((data) => {
      return { data }; // Wrap the JSON object in an object with a 'data' property
    })
    .catch((error) => {
      // Handle network errors or JSON parsing errors
      const networkError = new Error(error.statusText || 'Network Error');
      networkError.status = error.status || 0;
      return Promise.reject(networkError); // Reject with an Error object
    });
}

export default fetchModel;
