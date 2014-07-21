package eclipsePlugin.actions;

import java.net.MalformedURLException;
import java.net.URL;

import org.eclipse.jface.action.IAction;
import org.eclipse.jface.dialogs.MessageDialog;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.TextSelection;
import org.eclipse.jface.viewers.ISelection;
import org.eclipse.ui.IEditorPart;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.IWorkbenchWindow;
import org.eclipse.ui.IWorkbenchWindowActionDelegate;
import org.eclipse.ui.PartInitException;
import org.eclipse.ui.PlatformUI;
import org.eclipse.swt.widgets.Shell;
import org.eclipse.ui.browser.IWebBrowser;
import org.eclipse.ui.browser.IWorkbenchBrowserSupport;
import org.eclipse.ui.texteditor.IDocumentProvider;
import org.eclipse.ui.texteditor.ITextEditor;

//import com.google.common.io.Files;
//import org.apache.commons.io.FilenameUtils;

public class SearchAction implements IWorkbenchWindowActionDelegate {

	IWorkbenchWindow activeWindow = null;
	String selectedWord = null;
	String fileName = null;
	String fileType = null;
	
	
	public String getSearchURL(String nameToSearch, String Language) {
		//String githubURL = "https://github.com/search?l="+Language+"&q="+nameToSearch+"&ref=searchresults&type=Code";
		String githubURL = "http://d-maa-00387527:8000/search/"+nameToSearch+"/"+Language; 
		return githubURL;
	}
	
	public void run(IAction proxyAction) {
		// TODO Auto-generated method stub
		
		try {               
		    IEditorPart part = PlatformUI.getWorkbench().getActiveWorkbenchWindow().getActivePage().getActiveEditor();
		    
		    //IWorkbenchPage workbenchPage = PlatformUI.getWorkbench().getActiveWorkbenchWindow().getActivePage();
		    if(part != null){
		    	fileName = part.getEditorInput().getName();
		    	fileType = fileName.substring(fileName.lastIndexOf('.')+1);
		    }
		    
		    
		    
		    if ( part instanceof ITextEditor ) {
		        final ITextEditor editor = (ITextEditor)part;
		        IDocumentProvider prov = editor.getDocumentProvider();
		        IDocument doc = prov.getDocument(editor.getEditorInput());
		        ISelection sel = editor.getSelectionProvider().getSelection();
		        
		        //fileName = editor.getEditorInput().getName();
		        
		        if ( sel instanceof TextSelection ) {

		            // Here is your String
		            final TextSelection textSel = (TextSelection)sel;
		            selectedWord = textSel.getText();

		        }
		    }
		} catch ( Exception ex ) {
		    ex.printStackTrace();
		}
		
		//fileType = Files.getFileExtension(fileName);
		//fileType = fileName.substring(fileName.lastIndexOf('.')+1);
		//selectedWord += " " + fileName + " " + ext;
		
		//Shell shell = activeWindow.getShell();
		//MessageDialog.openInformation(shell, "Hello World", selectedWord);
		IWorkbenchBrowserSupport support = PlatformUI.getWorkbench().getBrowserSupport(); 
		IWebBrowser browser;
		try {
			System.out.println("In function");
			browser = support.createBrowser("someId");
			browser.openURL(new URL(getSearchURL(selectedWord,fileType)));
		} catch (PartInitException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}
	
	@Override
	public void selectionChanged(IAction proxyAction, ISelection selection) {
		// TODO Auto-generated method stub

	}

	@Override
	public void dispose() {
		// TODO Auto-generated method stub

	}

	@Override
	public void init(IWorkbenchWindow window) {
		// TODO Auto-generated method stub
		activeWindow = window;

	}

}
