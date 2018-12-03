'use strict';
//  ../sopromat/tubeC.html

var v_F_choice   = document.getElementById("choice_force");     // HTML Picture
var v_dia_ex     = document.getElementById("input_dia_ex");     // HTML Input
var v_dia_in     = document.getElementById("input_dia_in");     // HTML Input
var v_length     = document.getElementById("input_length");     // HTML Input
var v_St_choice  = document.getElementById("steel_sort");     // HTML Select steel
var v_out_St     = document.getElementById("steel_data");       // HTML Output steel data
var v_F          = document.getElementById("input_F");          // HTML Input

var v_buttonRUN  = document.getElementById("buttonRUN");        // HTML Button RUN

var v_out_stress = document.getElementById("output_stress");    // HTML Output
var v_out_area   = document.getElementById("output_area");      // HTML Output
var v_out_wx     = document.getElementById("output_wx");        // HTML Output
var v_out_wp     = document.getElementById("output_wp");        // HTML Output
var v_out_thick  = document.getElementById("output_thick");     // HTML Output
var v_out_massa  = document.getElementById("output_massa");     // HTML Output

window.addEventListener("load",page_onload);                    // onLoad
v_F_choice.addEventListener("click",Event_F_choice);        // Picture
v_dia_ex.addEventListener("input",inputIDec);                   // Input
v_dia_in.addEventListener("input",inputIDec);                   // Input
v_length.addEventListener("input",inputIDec);                   // Input
v_St_choice.addEventListener("change",Event_St_choice);   // Select
v_F.addEventListener("input",inputIDec);                        // Input
v_buttonRUN.addEventListener("click",Event_click_Button);       // Клик на кнопке

//**********************************************************************
// 0  steelName = a1;                 // Марка стали
// 1  ultimate_Strength = a2;         // Временное сопротивление
// 2  yield_Strength = a3;            // Предел текучести
// 3  static_Stretch_Stress_Max = b1; // Stretch - растяжение
// 4  static_Bend_Stress_Max = c1;    // Bend - изгиб
// 5  static_Twist_Stress_Max = d1;   // Twist - кручение
// 6  static_Cut_Stress_Max = e1;     // Cut - срез

var steels = [
//     0               1      2     3       4       5      6 
["сталь 3         ", 370.0, 245.0, 125.0, 150.0,  95.0,  75.0],  // 0	Сталь 3
["сталь 20 (Н)    ", 420.0, 250.0, 140.0, 170.0, 105.0,  85.0],  // 1   Сталь 20 (Н)
["сталь 20 (Ц-В59)", 500.0, 300.0, 165.0, 200.0, 125.0, 100.0],  // 2   Сталь 20 (Ц-В59)
["сталь 45 (Н)    ", 610.0, 360.0, 200.0, 240.0, 150.0, 125.0],  // 3   Сталь 45 (Н)
["сталь 45 (У)    ", 750.0, 450.0, 240.0, 290.0, 185.0, 145.0],  // 4   Сталь 45 (У)
["сталь 45 (М35)  ", 900.0, 650.0, 300.0, 360.0, 230.0, 185.0],  // 5   Сталь 45 (М35)
["сталь 45 (В42)  ",1000.0, 700.0, 300.0, 360.0, 230.0, 185.0],  // 6   Сталь 45 (В42)
["сталь 45 (В48)  ",1200.0, 950.0, 400.0, 480.0, 300.0, 240.0],  // 7   Сталь 45 (В48)
["сталь 45 (ТВЧ56)", 750.0, 450.0, 240.0, 290.0, 185.0, 145.0],  // 8   Сталь 45 (ТВЧ56)
["сталь 40Х (Н)   ", 630.0, 330.0, 200.0, 240.0, 150.0, 120.0],  // 9   Сталь 40Х (Н)
["сталь 40Х (У)   ", 800.0, 650.0, 270.0, 320.0, 200.0, 160.0],  // 10  Сталь 40Х (У)
["сталь 40Х (М39) ",1100.0, 900.0, 200.0, 450.0, 280.0, 230.0],  // 11  Сталь 40Х (М39)
["сталь 40Х (М48) ",1300.0,1100.0, 440.0, 530.0, 330.0, 270.0],  // 12  Сталь 40Х (М48)
["сталь 09Г2С	  ", 500.0, 350.0, 170.0, 200.0, 125.0, 100.0]   // 13  Сталь 09Г2С
];
//**********************************************************************

var F_sort = -1;
var F_sort_txt = ["При растяжении ", "При изгибе ", "При кручении ", "При срезе "];

// концепт: размеры в mm, площадь в mm2, сила в N, напряжение в N/mm2 (MPa)
var cil = {       // Объект цилиндр !!!!!!!
    dia_ex: 0,    // external diameter, mm
    dia_in: 0,    // internal diameter, mm
    lenght: 0,    // lenght, mm
    density: 0.00782, // density, g/mm3
    force: 0,     // force in normal cut, N
    koef_N_kg: 10,   // koef
    koef_mm_cm: 10,  // koef
    PiDiv16: 0.19634954, // Pi/16
    PiDiv32: 0.09817477, // Pi/32
    stress: function() {    // расчет напряжения в MPa (N/mm2)
        if(this.area() == 0) return 0;
        else {
            return this.force / this.area(); }
    },      // stress() in normal cut, N/mm2 (MPa)
    area: function() {    // расчет площади круга в mm2        
        if (this.dia_ex > this.dia_in) {
            return ((Math.PI * Math.pow(this.dia_ex, 2)) - (Math.PI * Math.pow(this.dia_in, 2))) / 4;  // mm2
        } else return 0;
    },      // area() of nofmal cut, mm2
    w_axial: function() {
        return Math.pow(this.dia_ex, 3.0) * this.PiDiv32 * (1.0 - Math.pow((this.dia_in / this.dia_ex), 4.0));
    },      // w_axial()
    w_polar: function() {
        return Math.pow(this.dia_ex, 3.0) * this.PiDiv16 * (1.0 - Math.pow((this.dia_in / this.dia_ex), 4.0));
    },      // w_polar()
    thickness: function() {    // расчет толщины стенки в mm        
        if (this.dia_ex > this.dia_in) {
            return (this.dia_ex - this.dia_in) / 2;  // mm
        } else return 0;
    },      // function thickness()
    massa: function() {    // расчет площади круга в mm2
            return this.volume() * this.density;  // mm3
    },      // mass()
    volume: function() {    // расчет площади круга в mm2        
        return this.area() * this.lenght;  // mm3
    },      // volume() of nofmal cut, mm2
    //      OUTPUT    
    output_stress: function() {
        v_out_stress.innerHTML = this.stress().toFixed(4);              // N/mm2
    },      // output_stress()
    output_area: function() {
        let areaForOut = this.area() / Math.pow(this.koef_mm_cm, 2);    // areaForOut в mm2; делить на Math.pow => для пересчета в cm2
        v_out_area.innerHTML = areaForOut.toFixed(4);
    },      // output_area()
    output_w_axial: function() {
        v_out_wx.innerHTML = (0.001 * this.w_axial()).toFixed(4);
    },      // output_w_axial()
    output_w_polar: function() {
        v_out_wp.innerHTML = (0.001 * this.w_polar()).toFixed(4);
    },      // output_w_axial()
    output_thick: function() {
        v_out_thick.innerHTML = this.thickness().toFixed(4);
    },      // output_thick()
    output_massa: function() {
        v_out_massa.innerHTML = (0.001 * this.massa()).toFixed(4);
    },      // output_massa()
    toString: function() {  // overload function toString()
        return 'It\'s cil.toString(): dia_ex = ' + this.dia_ex + '; dia_in = ' + this.dia_in
    }       // toString: function()
}           // var cil


function page_onload() {
    Event_F_choice();  
}   // page_onload()


function Event_F_choice() {
    if(F_sort < 3) {
        F_sort++;
    } else F_sort = 0;
    switch (F_sort) {
        case 0:
    v_F_choice.src="../images/pic128stretch.svg";
    v_F_choice.title="Растяжение";
            break;
        case 1:
    v_F_choice.src="../images/pic128bend.svg";
    v_F_choice.title="Изгиб";
            break;
        case 2:
    v_F_choice.src="../images/pic128twist.svg";
    v_F_choice.title="Кручение";
            break;
        case 3:
    v_F_choice.src="../images/pic128cut.svg";
    v_F_choice.title="Срез";
            break;    
        default:
            break;
    }   // switch
    Event_St_choice();
}       // Event_F_choice()


function Event_St_choice() {
    // console.log(v_St_choice.value);
    // console.log(v_St_choice.selectedIndex);
    v_out_St.innerText = "Марка стали = " + steels[v_St_choice.selectedIndex][0] + 
    "\nВременное сопротивление = " + steels[v_St_choice.selectedIndex][1] + " MPa" +
    "\nПредел текучести = " + steels[v_St_choice.selectedIndex][2] + " MPa\n" +
    F_sort_txt[F_sort] + " допустимое напряжение = " + steels[v_St_choice.selectedIndex][(F_sort+3)] + " MPa";
}		// Event_St_choice()


function clearAll_sopr() {
    v_out_stress.innerHTML = '0.0000';
    v_out_area.innerHTML = '0.0000';
    v_out_wx.innerHTML = '0.0000';
    v_out_wp.innerHTML = '0.0000';
    v_out_thick.innerHTML = '0.0000';
    v_out_massa.innerHTML = '0.0000';
}   // clearAll_sopr()


function inputIDec(event) {    // inputIDec(event)
    // console.log("\nEvent num " + ++i + ", type = " + event.type + "." + event.inputType + " in Element id = " + event.target.id);
    this.value = checkFix(this.value);
}   // inputIDec()


function Event_click_Button(event) {  // Событие нажатие кнопки Calculate Stress
    console.log(v_St_choice.value);
    console.log(v_St_choice.selectedIndex);
    console.log(steels[v_St_choice.selectedIndex]);
    console.log(steels[v_St_choice.selectedIndex][0]);
    console.log(steels[v_St_choice.selectedIndex][1]);
    // console.log("\nEvent num " + ++i + ", type == " + event.type + " in Element id == " + event.target.id);
    // console.log("v_dia_ex.value  == " + v_dia_ex.value + "; type == " + typeof(v_dia_ex.value));
    cil.dia_ex = evaluate(v_dia_ex.value);    // mm
    cil.dia_in = evaluate(v_dia_in.value);    // mm
    cil.lenght = evaluate(v_length.value);    // mm
    cil.force = evaluate(v_F.value) * cil.koef_N_kg;  // cil.force в ньютонах;  * cil.koef_N_kg = для пересчета в ньютоны
if(cil.dia_ex == 0) {  // если нет наружного диаметра
    clearAll_sopr();
    v_dia_ex.focus();
    return false;
}   // if()
if(cil.dia_ex <= cil.dia_in) {   // если внутр. диа. больше наружного или равен
    v_dia_in.value = '';
    clearAll_sopr();
    v_dia_in.focus();
    return false;
}   // if()
// debugger;
    cil.output_stress();
    cil.output_area();
    cil.output_w_axial();
    cil.output_w_polar();
    cil.output_thick();
    cil.output_massa();
}   // Event_click_Button


/* function Event_N_or_kg(event) {  // Event_N_or_kg()
    // console.log("\nEvent num " + ++i + ", type = " + event.type + " in Element id == " + event.target.id + "; v_N_or_kg.value = " + v_N_or_kg.value);
    // console.log(cil);
        // var force_tmp = v_F.value;
    switch (v_N_or_kg.value) {  // select
        case 'n':
        cil.koef_N_kg = 1;      
        if(v_F.value != '')
        v_F.value = v_F.value * 10; // кг вв ньютоны
            break;
        case 'kg':
        cil.koef_N_kg = 10;  
        if(v_F.value != '')        
        v_F.value = v_F.value / 10; // ньютоны в кг
            break;
        default:
        console.log("Myswitch = default");
}   // switch()
}   // Event_N_or_kg */


/* function Event_mm_or_cm(event) { // Event_mm_or_cm()
    // console.log("\nEvent num " + ++i + ", type = " + event.type + " in Element id == " + event.target.id + "; v_mm_or_cm.value = " + v_mm_or_cm.value);
    // console.log(cil);
    switch (v_mm_or_cm.value) {
        case 'cm':
            cil.koef_mm_cm = 10;
            break;
        case 'mm':
            cil.koef_mm_cm = 1;
            break;
        default:
            console.log("Myswitch = default");
    } // switch(ch)
    cil.output_area();
}   // Event_mm_or_cm */
