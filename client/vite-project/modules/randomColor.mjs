//let assignedColors = [];

/* export default  */function getRandomColor(assignedColors) {
  let availableColors = ['#08ff4a', '#ff08de', '#ff8308', '#ff0077', '#ededed', '#b300ff', '#84ab35', '#b07f6d', '#c406d1', '#adadad'];
  
 /*  if (availableColors.length === 0) {
    assignedColors = []; // Återställ listan över tilldelade färger när alla färger har använts
    availableColors = ['#08ff4a', '#ff08de', '#ff8308', '#ff0077', '#ededed', '#b300ff', '#84ab35', '#b07f6d', '#c406d1', '#adadad'];
  } */

  let randomColorIndex = Math.floor(Math.random() * availableColors.length);

  const randomColor = availableColors[randomColorIndex];
  assignedColors.push(randomColor); 
  availableColors.splice(randomColorIndex, 1); 
/*   let randomColor = availableColors[randomColorIndex];

  assignedColors.push(randomColor);
  
  availableColors.splice(randomColorIndex, 1);

  console.log(assignedColors, 'assigned colors');  */

  return randomColor;
}


