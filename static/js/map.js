fetch('/properties')
.then(response => response.json())
.then(data => {

data.forEach(property => {

var marker = L.marker([property.lat, property.lng]).addTo(map);

marker.on('click', function(){

marker.bindPopup("Loading predictions...").openPopup();

fetch('/predict', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({
features: [property.area, property.bedrooms, property.bathrooms, 2,1,5,10,0,1,0,1,0,1]
})
})
.then(res => res.json())
.then(priceData => {

fetch('/predict_rent', {
method:'POST',
headers:{
'Content-Type':'application/json'
},
body: JSON.stringify({
features: [property.area, property.bedrooms, property.bathrooms, 2,1,5,10,0,1,0,1,0,1]
})
})
.then(res => res.json())
.then(rentData => {

marker.setPopupContent(
"Area: " + property.area + " sqft<br>" +
"BHK: " + property.bedrooms + "<br>" +
"Predicted Price: ₹ " + priceData.predicted_price + "<br>" +
"Predicted Rent: ₹ " + rentData.predicted_rent
);

})
.catch(err => {
marker.setPopupContent("Error fetching rent prediction");
});

})
.catch(err => {
marker.setPopupContent("Error fetching price prediction");
});

});

});

})
.catch(error => {
console.error("Error loading properties:", error);
});