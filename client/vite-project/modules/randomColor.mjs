let assignedColors = [];

export default function getRandomColor() {
   let colors = ['#08ff4a', '#ff08de', '#ff8308', '#ff0077', '#ededed', '#b300ff', '#84ab35', '#b07f6d', '#c406d1', '#adadad'] 
   //green, hotpink, orange, coral, white, purple, olive, brown, plum, grey
    let availableColors = colors.filter(color => !assignedColors.includes(color));
    if (availableColors.length === 0) {
        assignedColors = [];
        availableColors = colors;
    }

    let randomColorIndex = Math.floor(Math.random() * availableColors.length);
    let randomColor = availableColors[randomColorIndex];

    assignedColors.push(randomColor);
    
    return randomColor;
  }


