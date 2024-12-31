const client_id = 'd3122c73ca094774a88360da4b90e9c6';
const client_secret = '0fa9601ac3b54549b7fb30131f25c42d';

function get_accesstoken(){
(async () => {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        body: `grant_type=client_credentials`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${btoa(`${client_id}:${client_secret}`)}` 
        },
        method: "POST"
    });

    if (!response.ok) {
        console.log(`Error: ${response.status} - ${response.statusText}`);
    } else {
        const data = await response.json();
        console.log(data.access_token);
    }
})();
}
return (get_accesstoken())

