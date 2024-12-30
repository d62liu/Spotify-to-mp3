async function fetchPlaylistTracks(accessToken, playlistId) {
    let trackNames = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${"2FfM3gA2Kl9Zl8PKsNmfgw"}/tracks`;
  
    try {
      while (nextUrl) {
        const response = await fetch(nextUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        if (!response.ok) {
          throw new Error(`Error fetching playlist tracks: ${response.statusText}`);
        }
  
        const data = await response.json();
  
        const tracks = data.items.map(item => item.track.name);
        trackNames = [...trackNames, ...tracks];
  
        nextUrl = data.next;
      }
  
      return trackNames;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }
  
  (async () => {
    const accessToken = 'BQDNSAGs9JbKzaryl5yoj_ZeueejI-emj7D_HYQhxw8Ckxemc7krttYZsvHh43qb5WkX7isyyavkyRBqv6zR53lmAU5P6N8VZHofZh8DFQZNIbmVmrwR2yaC209y1GFe8tp9p7YYDFtZHqy6bSok-TAa55qZeQ7AxAv97sz4K86ETh47OGwnw2O4Stdv6G1BIYJ1bhltlnyPsPdRme04gaWI2RGuij5DaVpcuwu5TxB7ktge_5R5_UJQNkFuBZuhgFuEewcbozDeJcYAtNZ6Gp0HHPUNbQTn'; // Replace with your Spotify OAuth token
    const playlistId = '2FfM3gA2Kl9Zl8PKsNmfgw'; // Replace with your Spotify playlist ID
  
    const tracks = await fetchPlaylistTracks(accessToken, playlistId);
    console.log('Tracks:', tracks);
  })();
console.log('he')

  