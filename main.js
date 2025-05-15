var button_generate = document.getElementById("button-generate");
var button_randomize = document.getElementById("button-randomize");
var input_color = document.getElementById("color")
var input_color_hex = document.getElementById("color-hex")
var slider_colors = document.getElementById("color-amount")
var slider_hue = document.getElementById("slider-hue")
var slider_contrast = document.getElementById("slider-contrast")
var grad_left = document.getElementById("grad-left");
var grad_right = document.getElementById("grad-right");
var color_center = document.getElementById("grad-center");

var color = input_color.value;
var color_amount = slider_colors.value;
var hue = slider_hue.value;
var contrast = slider_contrast.value;

var slider_colors_text = document.getElementById("value-colors")
var slider_hue_text = document.getElementById("value-hue")
var slider_contrast_text = document.getElementById("value-contrast")

var randomize_contrast = false;
var randomize_hue = false;
var randomize_color = true;

var slots_buttons = document.getElementById("slots-buttons")
var button_save = document.getElementById("button-save")
var slots_box = document.getElementById("slots-box")
var slots = {
    saved: [],
    count: 0,
    selected: null
};
class Slot {
    constructor(color,hue,contrast,amount) {
        this.color = color;
        this.hue = hue;
        this.contrast = contrast
        this.amount = amount;
    }
}
const buttons_extra = {
    override: {
        create: function() {
            if (document.getElementById("button-override") != null) return document.getElementById("button-override");
            else {
                var button = document.createElement("button");
                button.id = "button-override";
                button.textContent = "overwrite slot";
                button.onclick = slotOverride;
                slots_buttons.appendChild(button);
                slots_buttons.insertBefore(button,document.getElementById("button-export"));
                return;
            }
        },
        remove: function() {
            var button = document.getElementById("button-override");
            if (button == null) return;
            else button.remove();
        },
        get: function() {
            return document.getElementById("button-override")
        }
    },
    delete: {
        create: function() {
            if (document.getElementById("button-delete-slot") != null) return;
            else {
                var button = document.createElement("button");
                button.id = "button-delete-slot";
                button.textContent = "delete slot";
                button.onclick = slotDelete;
                slots_buttons.appendChild(button);
                slots_buttons.insertBefore(button, document.getElementById("button-export"));
                return button;
            }
        },
        remove: function() {
            var button = document.getElementById("button-delete-slot");
            if (button == null) return;
            else button.remove();
        },
        get: function() {
            return document.getElementById("button-delete-slot")
        }
    },
    export: {
        create: function() {
            if (document.getElementById("button-export") != null) return;
            else {
                var button = document.createElement("button");
                button.id = "button-export";
                button.textContent = "export palette";
                button.onclick = paletteExport;
                slots_buttons.appendChild(button);
                return button;
            }
        },
        remove: function() {
            var button = document.getElementById("button-export");
            if (button == null) return;
            else button.remove();
        },
        get: function() {
            return document.getElementById("button-export")
        }
    }
}
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();

    document.body.removeChild(element);
}
function slidersUpdate() {
    slider_colors_text.textContent = slider_colors.value;
    slider_hue_text.textContent = slider_hue.value+"%";
    slider_contrast_text.textContent = slider_contrast.value+"%";

    slider_hue_text.style.color = (parseInt(slider_hue.value) > parseInt(slider_contrast.value)) ? "#fe9886" : "rgb(214, 190, 235)"
    slider_hue_text.style.backgroundColor = (parseInt(slider_hue.value) > parseInt(slider_contrast.value)) ? "#1f0401" : "#110c15"

    slider_contrast_text.style.color = (parseInt(slider_contrast.value) > 80) ? "#fe9886" : "rgb(214, 190, 235)"
    slider_contrast_text.style.backgroundColor = (parseInt(slider_contrast.value) > 80) ? "#1f0401" : "#110c15"
}
function colorInputToHex() {
    input_color_hex.value = input_color.value;
    input_color_hex.style.backgroundColor = "#110c15";
    input_color_hex.style.color = "rgb(214, 190, 235)";
}
function colorHexToInput() {
    if (input_color_hex.value.length < 6) {
        input_color_hex.style.color = "#fe9886";
        input_color_hex.style.backgroundColor = "#1f0401";
        return;
    };
    if (input_color_hex.value.length == 6) {
        if (input_color_hex.value[0] != "#") {
            input_color_hex.value = "#"+input_color_hex.value;
        }
        else {
            input_color_hex.style.color = "#fe9886";
            input_color_hex.style.backgroundColor = "#1f0401";
            return;
        }
    }
    var color_rgb = fromHex(input_color_hex.value)
    if (!(color_rgb.r >= 0) || !(color_rgb.g >= 0) || !(color_rgb.b >= 0)) {
        input_color_hex.style.color = "#fe9886";
        input_color_hex.style.backgroundColor = "#1f0401";
        return;
    };
    input_color_hex.style.backgroundColor = "#110c15";
    input_color_hex.style.color = "rgb(214, 190, 235)";
    input_color.value = toHex(color_rgb.r,color_rgb.g,color_rgb.b);
}
function toHex(r,g,b) {
    var red = r.toString(16)
    var green = g.toString(16)
    var blue = b.toString(16)
    red = (red.length == 1) ? "0"+red : red;
    green = (green.length == 1) ? "0"+green : green;
    blue = (blue.length == 1) ? "0"+blue : blue;
    return "#"+red+green+blue;
}
function fromHex(hex) {
    //color = parseInt(hex, 16);
    return {
        r: parseInt(hex.slice(1,3),16),
        g: parseInt(hex.slice(3,5),16),
        b: parseInt(hex.slice(5),16)
    };
}
function toHSV (r,g,b) {
    var H = 0;
    var S = 0;
    var V = 0;

    r=r/255; g=g/255; b=b/255;
    var minRGB = Math.min(r,Math.min(g,b));
    var maxRGB = Math.max(r,Math.max(g,b));
   
    if (minRGB==maxRGB) {
     V = minRGB;
     return {H:0,S:0,V}
    }
   
    var d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
    var h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
    H = 60*(h - d/(maxRGB - minRGB));
    S = (maxRGB - minRGB)/maxRGB;
    V = maxRGB;
    return {
        H: (Math.round(H*1000))/1000,
        S: (Math.round(S*1000))/1000,
        V: (Math.round(V*1000))/1000
    };
}
function fromHSV(h,s,v) {

    if (h == 360) h = 0;

    var c = v*s;
    var x = c*(1 - Math.abs(h/60 % 2 - 1));
    var m = v-c;

    if (0<=h && h < 60) {
        r=c;g=x;b=0;
    } else if (60<=h && h < 120) {
        r=x;g=c;b=0;
    } else if (120<=h && h < 180) {
        r=0;g=c;b=x;
    } else if (180<=h && h < 240) {
        r=0;g=x;b=c;
    } else if (240<=h && h < 300) {
        r=x;g=0;b=c;
    } else if (300<=h && h < 360) {
        r=c;g=0;b=x;
    }

    return {
        r: Math.round((r+m) * 255),
        g: Math.round((g+m) * 255),
        b: Math.round((b+m) * 255)
    };
}
function colorShift(h,s,v,contrast,hue,index) {
    contrast = contrast/200;
    hue = hue/2;

    if (s == 0) h = 270;

    h = (h <= 60) ? h+hue*index : ((h > 60 && h < 265) ? h-hue*index: h+hue*index );
    s = s - contrast/2*index;
    v = v + contrast*index;

    if (h < 0) h = 360+h;
    if (h > 360) h = h-360;
    if (s < 0) s = 0;
    if (s > 1) s = 1;
    if (v < 0) v = 0;
    if (v > 1) v = 1;

    return {
        h: Math.min(h,360),
        s: Math.min(s,1),
        v: Math.min(v,1)
    }
}
function rng(max) {
    return Math.floor(Math.random() * max);
}
function grabColor(event) {
    var color;
    if (event.target.matches('.prompt')) color = event.target.parentElement.getAttribute("color");
    else color = event.target.getAttribute("color");
    navigator.clipboard.writeText(color);
    if (document.getElementById("popup") != null) document.getElementById("popup").remove();
    var popup = document.createElement("div");
    popup.id = "popup";
    popup.textContent = "copied to clipboard!";
    document.body.appendChild(popup);
    document.body.insertBefore(popup,document.body.firstChild);
    //
    var div = popup.appendChild(document.createElement("div"));
    div.id = "buffer-color"
    var icon = document.createElement("div");
    icon.id = "buffer-color-icon";
    icon.style.backgroundColor = color;
    var hex = document.createElement("p");
    hex.id = "buffer-color-hex";
    hex.textContent = color;
    //hex.style.color = color;
    div.appendChild(icon);
    div.appendChild(hex);
    //
    var popup_delete = window.setTimeout(function() {
        document.getElementById('popup').remove();
    },2000)
    while (popup_delete--) {
        window.clearTimeout(popup_delete);
    }
}
function checkboxToggle(parameter) {
    target = document.getElementById('button-rng-'+parameter)
    target.classList.toggle("on");
    if (target.matches('#button-rng-color')) randomize_color = !randomize_color;
    if (target.matches('#button-rng-contrast')) randomize_contrast = !randomize_contrast;
    if (target.matches('#button-rng-hue')) randomize_hue = !randomize_hue;
    if (!randomize_color && !randomize_contrast && !randomize_hue) button_randomize.disabled = true;
    if (randomize_color || randomize_contrast || randomize_hue) button_randomize.disabled = false;
}
function gradientRandomize() {
    if (randomize_color) {
        var r = rng(255);
        var g = rng(255);
        var b = rng(255);
        input_color.value = toHex(r,g,b);
        colorInputToHex();
    }
    if (randomize_contrast) {
        slider_contrast.value = rng(50)*2;
        slidersUpdate();
    }
    if (randomize_hue) {
        slider_hue.value = rng(50)*2;
        slidersUpdate();
    }
    gradientGenerate();
}
function gradientGenerate() {
    /// ============== GETTING VALUES ============== ///
        color = input_color.value;
        color_amount = slider_colors.value;
        hue = slider_hue.value;
        contrast = slider_contrast.value;
        grad_left.replaceChildren();
        grad_right.replaceChildren();
        color_center.style.backgroundColor = color;
        //color_center.setAttribute("onclick","grabColor(\'"+color+"\')")
        color_center.setAttribute("color",color)
        var grad_middle = (color_amount-1)/2+1;
        color = toHSV(fromHex(color).r,fromHex(color).g,fromHex(color).b);
    /// ============== GRADIENT GENERATION ============== ///
        for (let i=1; i<grad_middle; i++) {
            grad_unit = document.createElement("div");
            grad_unit.onclick = grabColor;
            grad_unit.id = "grad-"+i;
            grad_unit.className = "gradient-unit temp";
            grad_left.appendChild(grad_unit);
            color_this = colorShift(color.H,color.S,color.V,contrast,hue,i-grad_middle);
            color_this = fromHSV(color_this.h,color_this.s,color_this.v);
            color_this = toHex(color_this.r,color_this.g,color_this.b);
            grad_unit.style.backgroundColor = color_this;
            grad_unit.setAttribute("color",color_this)
            if (i == 1) grad_unit.classList.add("grad-end-left");
        }
        for (let i=grad_middle+1; i<=color_amount; i++) {
            grad_unit = document.createElement("div");
            grad_unit.onclick = grabColor;
            grad_unit.id = "grad-"+i;
            grad_unit.className = "gradient-unit temp";
            grad_right.appendChild(grad_unit);
            color_this = colorShift(color.H,color.S,color.V,contrast,hue,i-grad_middle);
            color_this = fromHSV(color_this.h,color_this.s,color_this.v);
            color_this = toHex(color_this.r,color_this.g,color_this.b);
            grad_unit.style.backgroundColor = color_this;
            grad_unit.setAttribute("color",color_this)
            if (i == color_amount) grad_unit.classList.add("grad-end-right")
        }
    /// ============== FIXING UNITS SIZE ============== ///
    
        height = grad_unit.offsetWidth;
        margin = (128-height)/2;
    
        //console.log(height)
    
        document.querySelectorAll('.temp').forEach((grad_unit) => {
            grad_unit.style.height = height+"px";
            grad_unit.style.marginTop = margin+"px"
            var copyprompt = document.createElement("div");
            copyprompt.classList.add("prompt");
            copyprompt.style.width = height+"px";
            copyprompt.style.height = height+"px";
            grad_unit.appendChild(copyprompt);
            grad_unit.classList.remove("temp");
          });
    /// ============== END OF FUNCTION ============== ///
}
function slotSelect(event) {
    if (event.target.matches(".selected")) return;
    /* console.log('slot selected') */
    document.querySelectorAll('.gradient-slot.selected').forEach((slot) => {
        slot.classList.toggle('selected');
      });
    event.target.classList.toggle('selected');
    slots.selected = event.target.getAttribute("slot");
    /* console.log('selected slot: '+slots.selected); */
    input_color.value = toHex(slots.saved[slots.selected].color.r,slots.saved[slots.selected].color.g,slots.saved[slots.selected].color.b);
    slider_colors.value = slots.saved[slots.selected].amount;
    slider_hue.value = slots.saved[slots.selected].hue;
    slider_contrast.value = slots.saved[slots.selected].contrast;
    gradientGenerate();
}
function slotSave() {
    if (slots.count >= 10) return;
    else {
        /* console.log('NEW slot saved'); */
        document.querySelectorAll('.gradient-slot.selected').forEach((slot) => {
            slot.classList.toggle('selected');
          });
        var slot = document.createElement("div");
        slot.id = "slot-"+slots.count;
        slot.setAttribute("slot",slots.count);
        slots.saved.push(new Slot(fromHSV(color.H,color.S,color.V),hue,contrast,color_amount));
/*         console.log('slot content: ');
        console.log(slots.saved[slot.getAttribute("slot")]) */
        slot.classList.add("gradient-slot");
        slot.classList.add("selected");
        slots_box.appendChild(slot);
        slot.onclick = slotSelect;
        slots.count++;
        if (slots.count == 1) {
            document.getElementById("no-slots-text").remove();
            buttons_extra.export.create();
            buttons_extra.override.create();
            buttons_extra.delete.create();
        }
        slots.selected = slot.getAttribute("slot");
        /* console.log('selected slot: '+slots.selected) */
    }
}
function slotDelete() {
    slots.saved.splice(slots.selected,1);
    if (slots.selected < slots.count) {
        document.querySelectorAll('.gradient-slot').forEach((slot) => {
            var id = slot.getAttribute("slot");
            if (id > slots.selected) {
                id--;
                slot.setAttribute("slot",id);
                slot.id = "slot-"+id;
            }
          });
    }
    document.getElementById("slot-"+slots.selected).remove();
    if (slots.count > 1) {
        if (slots.selected == 0) {
            document.getElementById("slot-0").click();
        } else
        document.getElementById("slot-"+(slots.selected-1)).click();
    }
    else {
        buttons_extra.override.remove();
        buttons_extra.export.remove();
        buttons_extra.delete.remove();
        var no_slots_text = document.createElement("div");
        no_slots_text.id = "no-slots-text";
        no_slots_text.textContent = "saved gradients will appear here";
        slots_box.appendChild(no_slots_text);
    }
    slots.count--;
    /* console.log(slots.count) */
}
function slotOverride() {
    //slots.saved.push(new Slot(fromHSV(color.H,color.S,color.V),hue,contrast,color_amount));
    slots.saved[slots.selected] = new Slot(fromHSV(color.H,color.S,color.V),hue,contrast,color_amount);
    /* console.log('slot overriden') */

    if (document.getElementById("popup") != null) document.getElementById("popup").remove();

    var popup = document.createElement("div");
    popup.id = "popup";
    popup.textContent = "slot overwritten!";
    popup.style.height = "3em";
    popup.style.top = "85%";
    document.body.appendChild(popup);
    document.body.insertBefore(popup,document.body.firstChild);
    var popup_delete = window.setTimeout(function() {
        document.getElementById('popup').remove();
    },2000)
    while (popup_delete--) {
        window.clearTimeout(popup_delete);
    }
}
function paletteExport() {
    var text = new String();
    text = text+"GIMP Palette\n#\n# Generated by MiraMappa Gradient Generator\n# https://miramappa.net/gradient-generator\n#\n"
    for (let i = 0; i < slots.count; i++) {
        text = text+"# Gradient Number "+(i+1)+"\n";
        var color_count = slots.saved[i].amount;
        var color = toHSV(slots.saved[i].color.r,slots.saved[i].color.g,slots.saved[i].color.b);
        for (let j = 1; j <= color_count; j++) {
            var color_result = colorShift(color.H,color.S,color.V,slots.saved[i].contrast,slots.saved[i].hue,j-((color_count-1)/2+1));
            color_result = fromHSV(color_result.h,color_result.s,color_result.v);
            //R
            text = (parseInt(color_result.r) < 100) ? ((parseInt(color_result.r) < 10) ? text+"  "+color_result.r+" " : text+" "+color_result.r+" " ) : text+color_result.r+" ";
            //G
            text = (parseInt(color_result.g) < 100) ? ((parseInt(color_result.g) < 10) ? text+"  "+color_result.g+" " : text+" "+color_result.g+" " ) : text+color_result.g+" ";
            //B
            text = (parseInt(color_result.b) < 100) ? ((parseInt(color_result.b) < 10) ? text+"  "+color_result.b+"   Untitled\n" : text+" "+color_result.b+"   Untitled\n" ) : text+color_result.b+"   Untitled\n";
        }
    }
    /* console.log(text); */
    download('palette.gpl',text);
}

slider_colors.addEventListener("input",slidersUpdate);
slider_hue.addEventListener("input",slidersUpdate);
slider_contrast.addEventListener("input",slidersUpdate);

input_color.addEventListener("input",colorInputToHex);
input_color_hex.addEventListener("input",colorHexToInput);

slidersUpdate();
gradientRandomize();
colorInputToHex();

button_save.onclick = slotSave;