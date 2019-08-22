function indexToTrueFalse(index) {
	if (index == "0") {return "true";}
	if (index == "1") {return "false";}
}
function connectString(arr) {
	var ret = "";
	for (var i=0;i<arr.length;i++) {
		if (ret == "") 
			ret+=arr[i];
		else
			ret+=","+arr[i];
	}
	return ret;
}
function removeString(fromStr, removeStr) {
	if (fromStr.indexOf(removeStr)>=0) {
		var tmpstrs = fromStr.split(',');
		var ret="";
		for (var i=0;i<tmpstrs.length;i++) {
			var tmpstr = tmpstrs[i];
			if (tmpstr!=removeStr) {
				if (ret=="") {ret=tmpstr;}
				else {ret += ","+tmpstr;}
			}
		}
		return ret;
	}
	return fromStr;
}
function addString(arr, str) {
	if (arr.indexOf(str)<0) {
		arr.push(str);
	}
}
function addAttribute(attStr, str) {
	if (attStr == null || attStr == "") {
		return str;
	}
	if (attStr.indexOf(str) <0) {
		return attStr+","+str;
	}
	var tmpstrs = attStr.split(',');
	var ret="";
	var found = false;
	for (var i=0;i<tmpstrs.length;i++) {
		var tmpstr = tmpstrs[i];
		if (tmpstr==str) {
			found = true;
		}
		if (ret=="") {ret=tmpstr;}
		else {ret += ","+tmpstr;}
	}
	if (!found) {
		ret += ","+str;
	}
	return ret;

}

var CaseProperties = function() {
	this.URErbName="";
    this.URErbVersion="";
    this.URElocale="";
    this.UREruleSetId="";
};
CaseProperties.prototype.toXML = function() {
	var ret = "";
	ret = "<caseProperties>";
    ret += "<property name=\"URErbName\">"+this.URErbName+"</property>";
    ret += "<property name=\"URErbVersion\">"+this.URErbVersion+"</property>";
    ret += "<property name=\"URElocale\">"+this.URElocale+"</property>";
    ret += "<property name=\"UREruleSetId\">"+this.UREruleSetId+"</property>";
    ret += "</caseProperties>";
	return ret;
};

var CaseData = function() {
	this.entities = Array();
};
CaseData.prototype.toXML = function() {
	var ret = "";
	ret = "<caseData>";
	for (var i=0;i<this.entities.length;i++) {
		ret+=this.entities[i].toXML();
	}
    ret += "</caseData>";
	return ret;
};
CaseData.prototype.getEntity = function(type, name) {
	for (var i=0;i<this.entities.length;i++) {
		var e = this.entities[i];
		if (e.type == type && e.id==name) {
			return e;
		}
	}
	var e = new CaseEntity();
	e.id=name;
	e.type=type;
	this.entities.push(e);
	return e;
};


var CaseEntity = function() {
	this.id="";
	this.type="";
	this.parentEntities = new Array();
	this.attributes = new Array();
	this.aggregates = new Array();
};
CaseEntity.prototype.toXML = function() {
	if (this.type == "session") return "";
	if (this.id == "-1") return "";
	
	var parents = "";
	for (var i=0;i<this.parentEntities.length;i++) {
		var p = this.parentEntities[i];
		if (p.type != "session") {
			if (parents == "") {
				parents = p.type+"_"+p.id;
			} else {
				parents += ","+p.type+"_"+p.id;
			}
		}
	};
	var ret = "";
	ret += "<entity name=\""+this.id+"\" type=\""+this.type+"\" parentEntity=\""+parents+"\">";
	for (var key in this.attributes) {
		ret+="<attribute name=\""+key+"\" value=\""+(this.attributes[key])+"\"/>";
	}
	for (var i=0;i<this.aggregates.length;i++) {
		ret+=this.aggregates[i].toXML();
	}
    ret += "</entity>";
	return ret;
};
CaseEntity.prototype.getParent = function(type,id) {
	for (var i=0;i<this.parentEntities.length;i++) {
		if (this.parentEntities[i].type==type && this.parentEntities[i].id==id) {
			return this.parentEntities[i];
		}
	}
	return null;
}; 

var Aggregate = function() {
	this.type="";
	this.name="";
	this.attributes=new Array();
};
Aggregate.prototype.toXML = function() {
	var ret = "";
	ret += "<aggregate name=\""+this.name+"\" type=\""+this.type+"\" >";
	for (var key in this.attributes) {
		ret+="<attribute name=\""+key+"\" value=\""+(this.attributes[key])+"\"/>";
	}
    ret += "</aggregate>";
	return ret;
	
};

var Case = function() {
	this.rulesetid="";
	this.locale="";
	this.lifetype="";
	this.caseProperties = new CaseProperties();
	this.caseData = new CaseData();
	this.underwriting = new Underwriting(this.caseData);
};
Case.prototype.toXML = function() {
	ret = "";
	ret +="<case>";
	ret += this.caseProperties.toXML();
	ret += this.caseData.toXML();
	ret += this.underwriting.toXML();
	ret +="</case>";
	
	return ret;
};

var Underwriting = function(caseData) {
	this.caseData = caseData;
	this.underwritingEntities = new Array();
};
Underwriting.prototype.toXML = function() {
	var ret = "";
	ret += "<underwriting>";
	for (var i=0;i<this.underwritingEntities.length;i++) {
		ret+=this.underwritingEntities[i].toXML();
	}
    ret += "</underwriting>";
	return ret;
};
Underwriting.prototype.getEntity = function(type, name) {
	for (var i=0;i<this.underwritingEntities.length;i++) {
		var e = this.underwritingEntities[i].caseEntity;
		if (e.type == type && e.id==name) {
			return this.underwritingEntities[i];
		}
	}
	var ce = this.caseData.getEntity(type,name);
	var e = new UnderwritingEntity(ce);
	this.underwritingEntities.push(e);
	return e;
};

var UnderwritingEntity = function(caseEntity) {
	this.caseEntity = caseEntity;
	this.baseQuestions = new Array();
	this.disclosures = new Array();
};
UnderwritingEntity.prototype.toXML = function() {
	var ret = "";
	if (this.caseEntity.type == "session" || this.caseEntity.id == "-1") {
		return "";
	}
	ret += "<entity name=\""+this.caseEntity.id+"\" type=\""+this.caseEntity.type+"\" >";
	ret += "<baseQuestions>";
	for (var i=0;i<this.baseQuestions.length;i++) {
		ret+=this.baseQuestions[i].toXML();
	}
	ret += "</baseQuestions>";

	ret += "<disclosures>";
	for (var i=0;i<this.disclosures.length;i++) {
		ret+=this.disclosures[i].toXML();
	}
	ret += "</disclosures>";

    ret += "</entity>";
	return ret;
};
UnderwritingEntity.prototype.toHTML = function() {
	var ret = "";
	if (this.caseEntity.type == "session" || this.caseEntity.id == "-1") {
		return "";
	}
	var line = this.htmlId();
	
	ret += "<ul id=\""+line+"\"  >";
	ret += "<li class=\"row\">";
	ret += "<div class=\"left\">";
	ret += "Entity:";
	ret += "</div>";
	ret += "<div class=\"right\">";
	ret += this.caseEntity.type+"_"+this.caseEntity.id;
	ret += "</div>";
	ret += "</li>";
	
	ret += "<div class=\"inner\">";
	for (var i=0;i<this.baseQuestions.length;i++) {
		ret+=this.baseQuestions[i].toHTML();
	}

	ret += "</div>";
    ret += "</ul>";
	return ret;
};

UnderwritingEntity.prototype.getBaseQuestion = function(id) {
	for (var i=0;i<this.baseQuestions.length;i++) {
		if (this.baseQuestions[i].id==id) {
			return this.baseQuestions[i];
		}
		
		if (this.baseQuestions[i].answerType == 'SECTION') {
			for (var j=0;j<this.baseQuestions[i].baseQuestions.length;j++) {
				if (this.baseQuestions[i].baseQuestions[j].id==id) {
					return this.baseQuestions[i].baseQuestions[j];
				}
				
			}			
		}
		
	}
	return null;
};
UnderwritingEntity.prototype.getRuleById = function(id) {
	for (var i=0;i<this.disclosures.length;i++) {
		if (this.disclosures[i].id==id) {
			return this.disclosures[i];
		}
	}
	return null;
};
UnderwritingEntity.prototype.getRuleByAlias = function(alias,category) {
	if (alias == null || alias == "") return null;
	if (category == null || category == "") return null;
	for (var i=0;i<this.disclosures.length;i++) {
		if (this.disclosures[i].alias==alias && this.disclosures[i].category==category) {
			return this.disclosures[i];
		}
	}
	return null;
};
UnderwritingEntity.prototype.search = function(text,category) {
	var ret = new Array();
	for (var i=0;i<this.disclosures.length;i++) {
		if (this.disclosures[i].alias.indexOf(text)>=0 && this.disclosures[i].category==category) {
			ret.push(this.disclosures[i]);
		}
	}
	return ret;
};

UnderwritingEntity.prototype.clone = function(caseEntity) {
	var ret = new UnderwritingEntity(caseEntity);

	for (var i=0;i<this.baseQuestions.length;i++) {
		ret.baseQuestions.push(this.baseQuestions[i].clone(ret));
	}
	for (var i=0;i<this.disclosures.length;i++) {
		if (ret.getRuleByAlias(this.disclosures[i].alias,this.disclosures[i].category)==null) {
			ret.disclosures.push(this.disclosures[i].clone(ret));
		}
	}
	return ret;
};
UnderwritingEntity.prototype.htmlId = function() {
	return "li_"+encodeURI(this.caseEntity.type+"_"+this.caseEntity.id);
};


var SearchType = function(baseQuestion) {
	this.baseQuestion=baseQuestion;
	this.triggerOn="";
	this.value="";
};

var BaseQuestion = function(underwritingEntity) {
	this.answerType="";
	this.underwritingEntity = underwritingEntity;
	this.searchType = new Array();
	this.page="";
	this.filter = new Array();
	this.prompt="";
	this.category="";
	this.conditionalParent=false;
	this.requiredDisclosure=false;
	this.defaultRule="";
	this.pickListRule=new Array();
	this.triggeredRules=new Array();
	this.id="";
	this.answer="";
	this.triggered = false;
	this.baseQuestions = new Array();
};
BaseQuestion.prototype.toXML = function() {
	var ret="";
	if (this.triggered || this.answer != "") {
		ret+="<baseQuestion>";
		ret+="<code>"+this.id+"</code>";
		ret+="<answer>"+this.answer+"</answer>";
		ret+="</baseQuestion>";
	}
	if (this.answerType=="SECTION") {
		for (var i=0;i<this.baseQuestions.length;i++) {
			ret +=this.baseQuestions[i].toXML();
		}
	}
	
	return ret;
};
BaseQuestion.prototype.htmlId = function() {
	return "li_bq_"+encodeURI(this.underwritingEntity.caseEntity.type+"_"+this.underwritingEntity.caseEntity.id+"_"+this.id);
};
BaseQuestion.prototype.toHTML = function() {
	var output="";
	var line = this.htmlId();
	var yesbtn = "btn_"+line+"_yes";
	var nobtn = "btn_"+line+"_no";
	
	var cssstyle="";
	if (this.matchFilter()==false) {
		cssstyle = "display:none";
	}
	
	if(this.answerType == 'HEADING'){
		output += '<div id="'+line+'"  style=\"'+cssstyle+'\">';
		output +='<li class="row" >';
		output +='<div class="leftheading">';
		output += this.prompt;
		output +='</div>';
		output += '</li>';
		output +='</div>';

	}else if(this.answerType == 'SECTION'){
		output += '<br/>';
		
		output += '<div id="'+line+'"  style=\"'+cssstyle+'\">';
		output +='<div class="leftsection">';
		output += this.prompt;
		output +='</div>';
		output += '<div class="inner">';

		for(var i = 0;i < this.baseQuestions.length;i++){
			var bq2 = this.baseQuestions[i];
			
			output += bq2.toHTML();
		}
		output += '</div>';

		output += '</div>';
		output += '<br/>';
	}else{
		output += '<div id="'+line+'"  style=\"'+cssstyle+'\">';
		output +='<li class="row" >';
		output +='<div class="left">';
		output += this.prompt;
		output +='</div>';
		output +='<div class="right">';

	
		if(this.answerType == 'TRIGGER_YES' || this.answerType == 'TRIGGER_NO' || this.answerType == 'TRIGGER_YES_OR_NO' ) {
			output += '<div class="yesnowrap"><button ';
			if(this.answer == "true"){
				output += 'class="activeanswerbutton"';
			}else{
				output += 'class="answerbutton"';
			}
			output += ' id="'+yesbtn+'" ';
			output += "onclick=clickBaseQuestion(\'"+this.underwritingEntity.caseEntity.type+"\',\'"+this.underwritingEntity.caseEntity.id+"\',\'"+this.id+"\',\'true\');>Yes</button></div>";
			output += '<div class="yesnowrap"><button ';
			if(this.answer == "false"){
				output += 'class="activeanswerbutton"';
			}else{
				output += 'class="answerbutton"';
			}
			output += ' id="'+nobtn+'" ';
			output += "onclick=clickBaseQuestion(\'"+this.underwritingEntity.caseEntity.type+"\',\'"+this.underwritingEntity.caseEntity.id+"\',\'"+this.id+"\',\'false\');>No</button></div>";
		}else if(this.answerType == 'ENTER_DETAILS'){
			if (this.matchFilter()) {
				this.triggered = true;
				this.answer = "true";
				
				var st=this.getSearchType();
				if (st.value=="SPECIFIED") {
					for (var i=0;i<this.pickListRule.length;i++) {
						var pr = this.pickListRule[i];
						var r = this.underwritingEntity.getRuleByAlias(pr.alias, this.category);
						if (this.triggeredRules.indexOf(r) < 0) {
							r.triggered = true;
							this.triggeredRules.push(r);
							addString(r.bqs, this.id);
						}
					}
				}
			}
			
		}

		output +='</div></li>';
		if (this.isTriggered() == true) {
			var st=this.getSearchType();
			if (st.value == "SEARCH") {
				var searchbtn = "btn_"+this.htmlId()+"_search";
				var li_id = searchbtn+st.triggerOn;
				var datalist_id=li_id+"_datalist";

				var btn = generateSearchBoxLine(li_id, datalist_id, this.underwritingEntity.caseEntity.type, this.underwritingEntity.caseEntity.id, this.id );
				output +=btn;
				for (var i=0;i<this.triggeredRules.length;i++) {
					output+=this.triggeredRules[i].toHTML(this.id);
				}
			}
			for (var i=0;i<this.pickListRule.length;i++) {
				var pr = this.pickListRule[i]
				if ( (st.triggerOn==null || st.triggerOn=="") || (st.triggerOn==pr.triggerOn)) {
					var r = this.underwritingEntity.getRuleByAlias(pr.alias, this.category);
					if (this.triggeredRules.indexOf(r) < 0) {
						r.triggered = false;
					} else {
						r.triggered = true;
					}
					output+=r.toHTML(this.id);
				}
			}
			
		}
		output +='<hr />';
		output +='</div>';
	}
	
	
	return output;
};
BaseQuestion.prototype.isTriggered = function() {
	if (this.answerType == 'TRIGGER_NO' && this.answer == "false") {
		return true;
	}
	if (this.answerType == 'TRIGGER_YES' && this.answer == "true") {
		return true;
	}
	if (this.answerType == 'TRIGGER_YES_OR_NO' && (this.answer == "false" || this.answer == "true")) {
		return true;
	}
	if (this.answerType == 'ENTER_DETAILS' && this.matchFilter()) {
		return true;
	}
	return false;
};
BaseQuestion.prototype.setAnswer=function(answer) {
	var oldTriggered = this.triggered;
	var oldSearchType = this.getSearchType();
	
	this.answer=answer;
	this.triggered = this.isTriggered();
	
	var session = this.underwritingEntity.caseEntity.getParent("session", this.underwritingEntity.caseEntity.id);
	if (session != null) {
		var changed = false;
		if (oldTriggered == false && this.triggered == true) {
			session.attributes["CONDITIONAL_BASE_QUESTION"] = addAttribute(session.attributes["CONDITIONAL_BASE_QUESTION"], this.id);
			changed = true;
		} else if (oldTriggered == true && this.triggered == false) {
			session.attributes["CONDITIONAL_BASE_QUESTION"] = removeString(session.attributes["CONDITIONAL_BASE_QUESTION"], this.id);
			changed = true;
		}
		
		if (changed) {
			var ue = this.underwritingEntity;
			for (var i=0;i<ue.baseQuestions.length;i++) {
				var bq = ue.baseQuestions[i];
				
				if (bq.id != this.id) {
					var matched = bq.matchFilter();
					if (matched == false) {
						bq.clear();
					} else {
						$("div[id='"+bq.htmlId()+"']").html(bq.toHTML());
						$("div[id='"+bq.htmlId()+"']").show("slow");
					}
				}
			}
		}
		
	}
	
	var line=this.htmlId();
	var yesbtn = "btn_"+line+"_yes";
	var nobtn = "btn_"+line+"_no";
	var searchbtn = "btn_"+line+"_search";

	var actBtn = null;
	var deactBtn = null;
	if (this.answer == "true") {
	
		actBtn =$("button[id='"+yesbtn+"']");
		deactBtn =$("button[id='"+nobtn+"']");
	}else if (this.answer == "false") {
		actBtn =$("button[id='"+nobtn+"']");
		deactBtn =$("button[id='"+yesbtn+"']");
		
	}
	if (actBtn != null) {
		actBtn.removeClass("answerbutton");
		actBtn.addClass("activeanswerbutton");
	}
	if (deactBtn != null) {	
		deactBtn.removeClass("activeanswerbutton");
		deactBtn.addClass("answerbutton");
	}

};
BaseQuestion.prototype.clear = function() {
	for (var i=0;i<this.triggeredRules.length;i++) {
		var rule = this.triggeredRules[i];
		if (rule.bqs.indexOf(this.id) >=0 ) {
			rule.bqs.splice(rule.bqs.indexOf(this.id),1);
			rule.clear(this.id);
		}
	}
	this.triggeredRules = new Array();
	
	var st = this.getSearchType();
	if (st != null) {
		var line=this.htmlId();
		var searchbtn = "btn_"+line+"_search";
		
		if (document.getElementById(searchbtn+st.triggerOn) != null) {
			$("li[id='"+searchbtn+st.triggerOn+"']").remove();
		}
	}
	
	this.answer = "";
	this.triggered = false;

	var session = this.underwritingEntity.caseEntity.getParent("session", this.underwritingEntity.caseEntity.id);
	if (session != null) {
		var attVal = session.attributes["CONDITIONAL_BASE_QUESTION"];
		if (attVal == null) {
			session.attributes["CONDITIONAL_BASE_QUESTION"]="";
		} else {
			session.attributes["CONDITIONAL_BASE_QUESTION"] = removeString(attVal, this.id);
		}
	}

	if (this.answerType.indexOf("YES") >0 || this.answerType.indexOf("NO")>0) {
		var yesbtn = "btn_"+this.htmlId()+"_yes";
		var nobtn = "btn_"+this.htmlId()+"_no";

		var deactBtn1 =$("button[id='"+yesbtn+"']");
		var deactBtn2 =$("button[id='"+nobtn+"']");
		deactBtn1.removeClass("activeanswerbutton");
		deactBtn1.addClass("answerbutton");
			
		deactBtn2.removeClass("activeanswerbutton");
		deactBtn2.addClass("answerbutton");

	}
	
	$("div[id='"+this.htmlId()+"']").hide("slow");
};
BaseQuestion.prototype.getSearchType = function() {
	if(!this.isTriggered()) {
		return null;
	}
	for (var i=0;i<this.searchType.length;i++) {
		var st = this.searchType[i];
		if (st.triggerOn == "yes" && this.answer == "true") {return st;}
		if (st.triggerOn == "no" && this.answer == "false") {return st;}
		if (st.triggerOn == null) {return st;}
	}
	return null;
};
BaseQuestion.prototype.matchFilter= function(specefiedEntity) {
	
	if (this.filter == null) return true;
	if (this.filter.length ==0) return true;
	
	var entity = specefiedEntity;
	if (entity == null) {
		entity = this.underwritingEntity.caseEntity;
	}
	for (var i=0;i<this.filter.length;i++){
		var filter = this.filter[i];
		var matched = false;
		
		if (entity.type== filter.type) {
			var attribute=entity.attributes[filter.attName];
			if (attribute != null) {
				var attVals = attribute.split(',');
				for (var l=0;l<attVals.length;l++) {
					var attVal = attVals[l];
					
					for (var m=0;m<filter.filterValues.length;m++){
						var filterVal = filter.filterValues[m];
						
						if (filterVal == attVal) {
							matched = true;
							break;
						}
					}
					if (matched) {
						break;
					}
				}
			} else {
				if (entity.type != "session") {
					matched = true;
				}
			}
			if (specefiedEntity != null) {
				return matched;
			}
			if (!matched) {
				return false;
			}
		}
		if (!matched) {
			for (var j=0;j<entity.parentEntities.length;j++) {
				if (entity.parentEntities[j].type== filter.type) {
					matched = this.matchFilter(entity.parentEntities[j]);
					if (matched) {
						break;
					}
				}
			}
		}
		if (!matched && specefiedEntity == null) {
			return false;
		}
	}
	if (specefiedEntity != null) {
		return false;
	}
	return true;
};
BaseQuestion.prototype.getRuleByAlias = function(alias) {
	for (var i=0;i<this.triggeredRules.length;i++) {
		if (this.triggeredRules[i].alias == alias) {
			return this.triggeredRules[i];
		}
	}

	return null;
};
BaseQuestion.prototype.clone = function(underwritingEntity) {
	var ret = new BaseQuestion(underwritingEntity);
	ret.answerType=	this.answerType;
	ret.underwritingEntity = underwritingEntity;
	ret.searchType = this.searchType.slice(0);
	ret.page=	this.page;
	ret.filter = this.filter.slice(0);
	ret.prompt=	this.prompt;
	ret.category=	this.category;
	ret.conditionalParent=this.conditionalParent;
	ret.requiredDisclosure=this.requiredDisclosure;
	ret.defaultRule=	this.defaultRule;
	ret.id=	this.id;
	ret.answer=	this.answer;
	ret.triggered =this.triggered;

	for (var i=0;i<this.baseQuestions.length;i++) {
		ret.baseQuestions.push(this.baseQuestions[i].clone(underwritingEntity));
	}
	ret.pickListRule = this.pickListRule.slice(0);
	for (var i=0;i<this.triggeredRules.length;i++) {
		var tmpR = underwritingEntity.getRuleByAlias(this.triggeredRules[i].alias,this.triggeredRules[i].category);
		if (tmpR == null) {
			tmpR= this.triggeredRules[i].clone(underwritingEntity);
			ret.triggeredRules.push(tmpR);
			underwritingEntity.disclosures.push(tmpR);
		} else {
			ret.triggeredRules.push(tmpR);
		}
	}
	return ret;
};

var PickListRule = function(bq) {
	this.bq = bq;
	this.id = "";
	this.alias = "";
	this.triggerOn = "";
};

var Rule = function(underwritingEntity) {
	this.underwritingEntity = underwritingEntity;
	this.id = "";
	this.alias = "";
	this.category = "";
	this.triggered = false;
	this.bqs = new Array();
	this.reflexiveQuestion = new ReflexiveQuestion(this);
};
Rule.prototype.toXML = function() {
	var ret = "";
	if (this.triggered == false) return ret;
	
	ret +="<condition>";
	ret +="<alias>"+this.alias+"</alias>";

	ret +="<linkedBaseQuestions>";
	for (var i=0;i<this.bqs.length;i++) {
		ret +="<baseQuestionRef>"+this.bqs[i]+"</baseQuestionRef>";
	}
	ret +="</linkedBaseQuestions>";
	
	ret +="<decisionPath>";
	ret += this.reflexiveQuestion.toXML();
	ret +="</decisionPath>";
	ret +="</condition>";
	return ret;
};
Rule.prototype.toHTML = function(bqId) {
	var ret = "";
	var line=this.htmlId(bqId);
	var cssstyle = "answerbutton";
	if (this.triggered == true) {
		cssstyle = "activeanswerbutton";
	}
	ret +="<ul id=\""+line+"\" class=\"row\">";
	ret +="<li class=\"left\"><button class=\""+cssstyle+"\" onclick=\"clickDisclosure(\'"+this.underwritingEntity.caseEntity.type+"\',\'"+this.underwritingEntity.caseEntity.id+"\',\'"+bqId+"\',\'"+this.id+"\',\'"+this.getAlias()+"\',\'"+this.category+"\');\" >"+this.alias+"</button></li>";

	if (this.triggered == true) {
		ret += this.reflexiveQuestion.toHTML();
	}
	ret +="</ul>";
	return ret;
};
Rule.prototype.getAlias = function() {
	var ret = this.alias;
	ret=ret.replace("\"","\\\"");
	ret=ret.replace("\'","\\\'");
	//ret=ret.replace("\\","\\\\");
	return ret;
};

Rule.prototype.clone = function(underwritingEntity) {
	var tmpR = underwritingEntity.getRuleByAlias(this.alias, this.category);
	if (tmpR != null) {
		return tmpR;
	}
	var ret = new Rule(underwritingEntity);
	
	ret.id=this.id
	ret.alias=this.alias;
	ret.category=this.category;
	ret.bqs=this.bqs.slice(0);
	ret.triggered=this.triggered;
	ret.reflexiveQuestion=this.reflexiveQuestion.clone(ret);
	return ret;
}
Rule.prototype.htmlId = function(bqId) {
	return "li_dis_"+encodeURI(this.underwritingEntity.caseEntity.type+"_"+this.underwritingEntity.caseEntity.id+"_"+bqId+"_"+this.id+"_"+this.alias+"_"+this.category);
};
Rule.prototype.clear = function(bqId) {
	var n = this.reflexiveQuestion;
	var line = this.htmlId(bqId);
	while (n != null) {
		$("ul[id='"+line+"']").find("div[id='"+n.htmlId()+"']").remove();
		n = n.next();
	}
	$("ul[id='"+line+"']").remove();
	this.bqs.splice(this.bqs.indexOf(bqId),1);
	this.triggered = false;
};

var ReflexiveQuestion = function(rule) {
	this.id = "";
	this.rule = rule;
	this.type="";
	this.prompt="";
	this.choice=-1;
	this.answer="";
	this.index="";
	this.source="";
	this.branches=new Array();
	this.choices=new Array();
};
ReflexiveQuestion.prototype.toXML = function() {
	var ret="";
	if (this.answer != "") {
	    ret+="<questionStep>";
        ret+="<reflexiveQuestion>";
        ret+="<answerValue>"+this.answer+"</answerValue>";
        ret+="</reflexiveQuestion>";
        ret+="</questionStep>";
		
		var n = this.next();
		if (n != null) {
			ret+= n.toXML();
		}
	}
	return ret;
};
ReflexiveQuestion.prototype.next = function() {
	if (this.choice < 0) return null;
	
	if (this.choice>this.branches.length-1) return null;
	
	var branch = this.branches[this.choice];
	
	for (var i=0;i<this.choices.length;i++) {
		if (this.choices[i].index==branch.index) {
			return this.choices[i];
		}
	}
	return null;
};
ReflexiveQuestion.prototype.setAnswer=function(answer) {
	this.answer=answer;
	var oldN = this.next();
	if (oldN != null) {
		oldN.clear();
	}
	if (answer=="") {
		this.rule.triggered = false;
		return;
	}
	this.rule.triggered = true;
	
	var line = this.htmlId();
	var oldChoice = this.choice;
	this.choice = -1;
	if (this.type == 'BOOLEAN') {
		for (var i=0;i<this.branches.length;i++) {
			if (indexToTrueFalse(this.branches[i].index)==answer) {
				if (oldChoice >=0 ) {
					var btn = "btn_"+line+"_"+oldChoice;
					var deactBtn =$("button[id='"+btn+"']");
					
					deactBtn.removeClass("activeanswerbutton");
					deactBtn.addClass("answerbutton");
				}
				this.choice=this.branches[i].index;
				if (this.choice >=0 ) {
					var btn = "btn_"+line+"_"+this.choice;
					var actBtn =$("button[id='"+btn+"']");
					actBtn.removeClass("answerbutton");
					actBtn.addClass("activeanswerbutton");
				}
				break;
			}
		}
	} else if (this.type =='OPTION') {
		var noSource = (this.source == null || this.source =="");
		for (var i=0;i<this.branches.length;i++) {
			if ( (noSource && this.branches[i].index==answer) || (!noSource && this.branches[i].code==answer)) {
				if (oldChoice >=0 ) {
					var btn = "btn_"+line+"_"+oldChoice;
					var deactBtn =$("button[id='"+btn+"']");
					
					deactBtn.removeClass("activeanswerbutton");
					deactBtn.addClass("answerbutton");
				}
				this.choice=this.branches[i].index;
				if (this.choice >=0 ) {
					var btn = "btn_"+line+"_"+this.choice;
					var actBtn =$("button[id='"+btn+"']");
					actBtn.removeClass("answerbutton");
					actBtn.addClass("activeanswerbutton");
				}

				break;
			}
		}
	} else if (this.type =='RANGE') {
		for (var i=0;i<this.branches.length;i++) {
			var n=parseInt(answer)+1;
			if (i<this.branches.length-1) {
				n=parseInt(this.branches[i+1].value)
			}
			if (parseInt(this.branches[i].value)<=parseInt(answer) && parseInt(answer) < n) {
				this.choice=this.branches[i].index;
				break;
			}
		}
		$("input[id='"+line+"']").val(answer);
	} else if (this.type =='FREE_TEXT') {
		this.choice=0;
		$("input[id='"+line+"']").val(answer);
	}

	var newN = this.next();
	if (newN != null) {
		var input=this.htmlId();
		if (document.getElementById(input) != null) {
			$("div[id='"+input+"']").after(newN.toHTML());
		}
		if (newN.source != null && newN.source != "") {
			newN.setAnswer(newN.getSourceAnswer());
		}
	}
};
ReflexiveQuestion.prototype.getSourceAnswer = function() {
	if (this.source != null && this.source != "") {
		var caseEntity = this.rule.underwritingEntity.caseEntity;
		var type = this.source.split('/')[0];
		var attName = this.source.split('/')[1];
		
		var val = null;
		if (caseEntity.type == type) {
			return caseEntity.attributes[attName];
		} else {
			return caseEntity.getParent(type, caseEntity.id).attributes[attName];
		}
	}
	return "";
}
ReflexiveQuestion.prototype.clear = function() {
	var n = this.next();
	var targetArr = new Array();
	targetArr.push(this);
	
	while (n != null) {
		targetArr.push(n);
		n = n.next();
	}
	
	n = targetArr.pop();
	while (n != null) {
		n.choice = -1;
		n.answer = "";
		var input=n.htmlId();
		$("div[id='"+input+"']").remove();
		
		n = targetArr.pop();
	}
};

ReflexiveQuestion.prototype.toHTML = function() {
	var ret="";
	var line=this.htmlId();
	var input=line;

	var cssstyle="";
	if (this.source != null && this.source !="") {
		this.answer = this.getSourceAnswer();
		cssstyle = " style=\"display:none\" ";
	}
	
	ret +="<div id=\""+line+"\" >";
	var rule = this.rule;
	var ue = this.rule.underwritingEntity;
	
	if (this.type=="RANGE") {
		ret +="<li class=\"row\" "+cssstyle+">";
		ret +="<div class=\"left\">"+this.prompt+"</div>";
		ret +="<div class=\"right\">";
		ret += "<input  class=\"selection\" type=\"text\" id=\""+input+"\" onchange=\"setReflexiveAnswer(\'"+ue.caseEntity.type+"\', \'"+ue.caseEntity.id+"\', \'"+rule.getAlias()+"\', \'"+rule.category+"\', \'"+this.id+"\', this.value)\" value=\""+this.answer+"\"/>";
		ret +="</div>";
		ret +="</li>";
	}
	else if (this.type=="BOOLEAN" ) {
		ret +="<li class=\"row\" "+cssstyle+">";
		ret +="<div class=\"left\">"+this.prompt+"</div>";
		ret +="<div class=\"right\">";
		for (var i=0;i<this.branches.length;i++) {
			var branch = this.branches[i];
			var btn = "btn_"+input+"_"+branch.index;
			
			ret += '<div class="yesnowrap"><button ';
			if(this.answer == indexToTrueFalse(branch.index)){
				ret += 'class="activeanswerbutton"';
			}else{
				ret += 'class="answerbutton"';
			}
			ret += ' id="'+btn+'" ';
			ret += "onclick=\"setReflexiveAnswer(\'"+ue.caseEntity.type+"\', \'"+ue.caseEntity.id+"\', \'"+rule.getAlias()+"\', \'"+rule.category+"\', \'"+this.id+"\', \'"+indexToTrueFalse(branch.index)+"\')\" >"+branch.value+"</button></div>";

		}
		ret +="</div>";
		ret +="</li>";
		
	}
	else if (this.type=="OPTION") {
		ret +="<li class=\"row\" "+cssstyle+">"+this.prompt+"</li>";
		var noSource = (this.source == null || this.source =="");
		for (var i=0;i<this.branches.length;i++) {
			ret +="<li class=\"row\" "+cssstyle+">";
		


		var branch = this.branches[i];
			var btn = "btn_"+input+"_"+branch.index;
			ret +="<div class=\"left\"></div>";
			ret +="<div class=\"right\">";
			ret += '<div class="yesnowrap"><button ';
			if ( (noSource && branch.index==this.answer) || (!noSource && branch.code==this.answer)) {
				ret += 'class="activeanswerbutton"';
			}else{
				ret += 'class="answerbutton"';
			}
			ret += ' id="'+btn+'" ';
			ret += "onclick=\"setReflexiveAnswer(\'"+ue.caseEntity.type+"\', \'"+ue.caseEntity.id+"\', \'"+rule.getAlias()+"\', \'"+rule.category+"\', \'"+this.id+"\', \'"+branch.index+"\')\" >"+branch.value+"</button></div>";
			ret +="</div>";
			ret +="</li>";
		}
		
	}	else if (this.type=="FREE_TEXT") {
		ret +="<li class=\"row\" "+cssstyle+">";
		ret +="<div class=\"left\">"+this.prompt+"</div>";
		ret +="<div class=\"right\">";
		ret += "<input class=\"selection\" type=\"text\" id=\""+input+"\"  onchange=\"setReflexiveAnswer(\'"+ue.caseEntity.type+"\', \'"+ue.caseEntity.id+"\', \'"+rule.getAlias()+"\', \'"+rule.category+"\', \'"+this.id+"\', this.value)\" value=\""+this.answer+"\"/>";
		ret +="</div>";
		ret +="</li>";
	}
	
	var n = this.next();
	if (n!=null) {
		ret += n.toHTML();
	}


	ret +="</div>";

	return ret;
};


ReflexiveQuestion.prototype.clone = function(rule) {
	var ret= new ReflexiveQuestion();
	ret.id	=	this.id;
	ret.rule = rule;
	ret.type=	this.type;
	ret.prompt=this.prompt;
	ret.choice=this.choice;
	ret.answer=this.answer;
	ret.source=this.source;
	ret.index=this.index;
	ret.branches=this.branches.slice(0);

	for (var i=0;i<this.choices.length;i++) {
		ret.choices.push(this.choices[i].clone(rule));
	}
	return ret;
};
ReflexiveQuestion.prototype.htmlId = function() {
	return "li_dis_rq_"+encodeURI(this.rule.underwritingEntity.caseEntity.type+"_"+this.rule.underwritingEntity.caseEntity.id+"_"+this.rule.id+"_"+this.rule.alias+"_"+this.rule.category+"_"+this.id);
};

var Filter = function(baseQuestion, name) {
	this.name=name;
	this.type=name.split('/')[0];
	this.attName=name.split('/')[1];
	this.filterValues = new Array();
	this.baseQuestion = baseQuestion;
};

var Branch = function(reflexiveQuestion){
	this.reflexiveQuestion=reflexiveQuestion;
	this.index = "";
	this.value="";
	this.code = "";
}

function setReflexiveAnswer(entityType, entityId, alias,category, rqid,value) {
	var ue = ureCase.underwriting.getEntity(entityType, entityId);
	var rule = ue.getRuleByAlias(alias,category);
	
	var rq = rule.reflexiveQuestion;
	while (rq.id != rqid) {
		rq = rq.next();
	}
	rq.setAnswer(value);
	
}

function clickDisclosure(entityType, entityId, bqId, ruleid, alias, category) {
	var ue = ureCase.underwriting.getEntity(entityType, entityId);
	var rule = ue.getRuleByAlias(alias,category);
	var bq = ue.getBaseQuestion(bqId);
	
	var line=rule.htmlId(bqId);
	if (bq.triggeredRules.indexOf(rule)>=0) {
		rule.bqs.splice(rule.bqs.indexOf(bqId),1);
		if (rule.bqs.length == 0) {
			rule.triggered = false;
			
			var next = rule.reflexiveQuestion;
			if (next != null) {
				next.clear();
			}
		}
		
		var n = rule.reflexiveQuestion;
		while (n != null) {
			$("ul[id='"+line+"']").find("div[id='"+n.htmlId()+"']").remove();
			n = n.next();
		}
		
		bq.triggeredRules.splice(bq.triggeredRules.indexOf(rule),1);
		var inPickList = false;
		for (var i=0;i<bq.pickListRule.length;i++) {
			var pr = bq.pickListRule[i];
			if (pr.alias == rule.alias && pr.bq.id == bq.id) {
				inPickList = true;
				break;
			}
		}
		if (inPickList == false) {
			$("div[id='"+bq.htmlId()+"']").find("ul[id='"+line+"']").remove();
		}

		var button =$("ul[id='"+line+"']").find("button");
		button.removeClass("activeanswerbutton");
		button.addClass("answerbutton");
		
	} else {
		rule.triggered = true;
		var button =$("ul[id='"+line+"']").find("button");
		button.removeClass("answerbutton");
		button.addClass("activeanswerbutton");

		$("ul[id='"+line+"']").append(rule.reflexiveQuestion.toHTML());
		if (rule.reflexiveQuestion.source != null && rule.reflexiveQuestion.source != "") {
			rule.reflexiveQuestion.setAnswer(rule.reflexiveQuestion.getSourceAnswer());
		}
		addString(rule.bqs,bqId);

		if (bq.triggeredRules.indexOf(rule)<0) {
			bq.triggeredRules.push(rule);
		}
	}
}

function clickBaseQuestion(entityType, entityId, id, answer) {
	var ue = ureCase.underwriting.getEntity(entityType, entityId);
	var bq = ue.getBaseQuestion(id);
	
	bq.setAnswer(answer);
}
function generateSearchBoxLine(li_id, datalist_id, entityType, entityId, id ) {
	var btn = "<li id=\""+li_id+"\" class=\"searchrow\">";
	btn+="<div class=\"left\">";
	btn+="<input class=\"selection\" list=\""+datalist_id+"\" placeholder=\"e.g. search text\" oninput=\"searchChange(\'"+entityType+"\', \'"+entityId+"\', \'"+id+"\', \'"+datalist_id+"\', this.value)\" onblur=\"searchChange(\'"+entityType+"\', \'"+entityId+"\', \'"+id+"\', \'"+datalist_id+"\', this.value)\" />";
	btn+="<datalist id=\""+datalist_id+"\" style=\"display : none\"></datalist>";
	btn+="</div>";
	btn+="<div class=\"confirmwrap\">";
	btn+="<button class=\"button\" onclick=\"search(\'"+entityType+"\', \'"+entityId+"\', \'"+id+"\', \'"+li_id+"\')\">Select</button>";
	btn+="</div>";
	btn+="</li>";
	return btn;
}


function searchChange(entityType, entityId, id, datalist, value) {
	var ue = ureCase.underwriting.getEntity(entityType, entityId);
	var bq = ue.getBaseQuestion(id);

	$("datalist[id='"+datalist+"']").children().remove();
	
	var arr = ue.search(value,bq.category);
	var r = arr.pop();
	while (r != null) {
		$("datalist[id='"+datalist+"']").append("<option value=\""+r.getAlias()+"\"/>");
		r = arr.pop();
	}
}

function search(entityType, entityId, id, li_id) {
	var ue = ureCase.underwriting.getEntity(entityType, entityId);
	var bq = ue.getBaseQuestion(id);

	var value = $("li[id='"+li_id+"']").find("input").val();

	var st = bq.getSearchType();
	if (st.value == "SEARCH") {
		var r = ue.getRuleByAlias(value,bq.category);
		if (r != null) {
			if (bq.triggeredRules.indexOf(r)<0) {
				bq.triggeredRules.push(r);
			}
			if (r.bqs.indexOf(bq.id)<0) {
				addString(r.bqs,bq.id);
				r.triggered = true;
				$("li[id='"+li_id+"']").after(r.toHTML(bq.id));
			}
		} else if (value != null && value != "" && bq.defaultRule != "") {
			r = ue.getRuleById(bq.defaultRule);
			if (r != null) {
				var tmpR = new Rule(ue);
				tmpR.alias=value;
				tmpR.id = r.id;
				tmpR.reflexiveQuestion = r.reflexiveQuestion.clone(tmpR);
				tmpR.category = bq.category;
				if (bq.getRuleByAlias(tmpR.alias)==null)
					bq.triggeredRules.push(tmpR);
				if (ue.getRuleByAlias(tmpR.alias,tmpR.category)==null)
					ue.disclosures.push(tmpR);
				
				if (tmpR.bqs.indexOf(bq.id)<0) {
					addString(tmpR.bqs,bq.id);
					tmpR.triggered = true;
					$("li[id='"+li_id+"']").after(tmpR.toHTML(bq.id));
				}
			}
		}
	} else {
		bq.setAnswer(value);
	}
}