$( document ).ready(function() {

	var cellState = ['added', 'deleted', 'modified', 'unchanged', 'empty'];
	var cellSide = ['local', 'base', 'remote'];
	var cells = IPython.notebook.get_cells();
	
	//The indexing for IPython.notebook.get_cells_element(index) messes up with append in 
	//generate_merge_collumn so this data-structure was created to preserve index.
	var cellElements = new Array();
	for(var i = 0; i < cells.length; i++){
		cellElements[i] = IPython.notebook.get_cell_element(i);
	}
    
	
	var init = function(){
    var cells = IPython.notebook.get_cells();
    console.log('Initializing nbdiff.');
    if (typeof cells[0].metadata.state !== 'undefined') {
      console.log('Found nbdiff metadata in the notebook.');
      console.log('Hiding the normal notebook container.');
      $('#notebook-container').hide();

      console.log('Creating a new notebook container.');
      $('#notebook').append(generate_notebook_container());

      console.log('Initializing merge rows.');
      init_notebook_merge_rows();
    }
	};
	
	var init_notebook_merge_rows = function(){
		
		for (var i = 0; i < cells.length; i++) {
      console.log('Processing cell #' + i + '...');
			parse_merge_row( cells[i], i);
		}
		$('#notebook-container-new').append(generate_notebook_container_end_space());
	};
	
	var parse_merge_row = function(cell, index){
		var side = cell.metadata.side;
		var state = cell.metadata.state;
		
		if (side === cellSide[0]){
      console.log('New row. Adding local cell.');
      var new_row = $(generate_empty_merge_row());
      new_row.find("input.merge-arrow-right").click(function(index, state, row) {
        return function(){
          // TODO we need to keep track, in memory, of the in-memory cells we're moving around
          //      so that we can exfiltrate the data and save the resulting notebook.
          var rightCell = row.find('.row-cell-merge-local .cell');
          rightCell.addClass(get_state_css(state));
          var htmlClass = ".row-cell-merge-base";
          row.children(htmlClass).append(rightCell);
        }     
      }(index, state, new_row));
        
      new_row.find("input.merge-arrow-left").click(function(index, state, row) {
        return function() {
          var rightCell = row.find('.row-cell-merge-remote .cell');
          rightCell.addClass(get_state_css(state));
          var htmlClass = ".row-cell-merge-base";
          row.children(htmlClass).append(rightCell);
        }
      }(index, state, new_row));
        
			$('#notebook-container-new').append(new_row);
		}		
    else {
      console.log('Adding ' + side + ' cell.');
    }
		generate_merge_collumn(side, state, index);		
	};
    
   
	
	var generate_merge_collumn = function(side, state, index){
		var cellHTML = cellElements[index];
		cellHTML.addClass(get_state_css(state));
		var lastRow = $("#notebook-container-new").children().last();
		var htmlClass = ".row-cell-merge-"+side;
		lastRow.children(htmlClass).append(cellHTML);
	};
	
	var get_state_css = function(state){
		if(state == cellState[0]){
			return "added-cell";
		} else if ( state == cellState[1]){
			return "deleted";
		} else if ( state == cellState[2]){
			return "changed";
		} else {
			return "";
		} 
	};
	
	var generate_merge_control_collumn = function(side) {
		var mergeArrowClass = 'merge-arrow-left';
		if(side == cellSide[0]){
			return "<input value='->' data-cell-idx='0' class='merge-arrow-right' type='button'>";
		} else {
			return "<input value='<-' data-cell-idx='0' class='merge-arrow-left' type='button'>";
		}		
	};
	
	var generate_empty_merge_row = function() {
		return "<div class='row'>"+
					"<div class='row-cell-merge-local'></div>"+
					"<div class='row-cell-merge-controls-local'>"+generate_merge_control_collumn("local")+"</div>"+
					"<div class='row-cell-merge-remote'></div>"+
					"<div class='row-cell-merge-controls-remote'>"+generate_merge_control_collumn("remote")+"</div>"+
					"<div class='row-cell-merge-base'></div>"+
				"</div>";
	};

	var generate_notebook_container = function() {
		return "<div class='container' id='notebook-container-new' style='display:inline'></div>";
	};
	
	var generate_notebook_container_end_space = function() {
		return "<div class='end_space'></div>";
	};
	
	
	init();
});
